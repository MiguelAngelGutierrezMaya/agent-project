import { DomainValidationError } from '@src/infrastructure/shared/utils/errors/domain';
import type { EmbeddingConfig } from '@modules/embedding/domain/models/EmbeddingConfig';

/**
 * Embedding Config DTO
 *
 * @description
 * Data Transfer Object for embedding configuration data.
 */
export class EmbeddingConfigDTO {
  constructor(
    public readonly schemaName: string,
    public readonly embeddingModel: string,
    public readonly batchEmbedding: boolean,
    public readonly vectorDimensions: number
  ) {}

  /**
   * Create DTO from database record
   *
   * @param data Raw data from database
   * @returns Tuple of [DTO?, Error?]
   */
  static create(
    data: Record<string, string | number | boolean>
  ): [EmbeddingConfigDTO?, DomainValidationError?] {
    const schemaName = data.schema_name as string;
    const embeddingModel = data.embedding_model as string;
    const batchEmbedding = Boolean(data.batch_embedding);
    const vectorDimensions = Number(data.vector_number);

    /* Validate required fields */
    if (!schemaName || !embeddingModel || vectorDimensions <= 0) {
      return [
        undefined,
        new DomainValidationError('Invalid embedding configuration data'),
      ];
    }

    return [
      new EmbeddingConfigDTO(
        schemaName,
        embeddingModel,
        batchEmbedding,
        vectorDimensions
      ),
      undefined,
    ];
  }

  /**
   * Convert DTO to domain model
   *
   * @returns EmbeddingConfig domain model
   */
  public toDomain(): EmbeddingConfig {
    return {
      schemaName: this.schemaName,
      embeddingModel: this.embeddingModel,
      batchEmbedding: this.batchEmbedding,
      vectorDimensions: this.vectorDimensions,
    };
  }
}
