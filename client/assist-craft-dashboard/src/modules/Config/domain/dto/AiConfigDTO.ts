import type { AiConfig } from '@/modules/Config/domain/models/AiConfig';
import { DomainValidationError } from '@/modules/shared/domain/errors/DomainValidationError';

/**
 * AI Configuration DTO
 *
 * @description
 * Data Transfer Object for AI model configuration.
 * Validates data from API before converting to domain model.
 */
export class AiConfigDTO {
  constructor(
    public readonly id: string,
    public readonly chatModel: string,
    public readonly embeddingModel: string,
    public readonly temperature: number,
    public readonly maxTokens: number,
    public readonly batchEmbedding: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  /**
   * Create DTO from API payload
   *
   * @param data Raw data from API
   * @returns Tuple of [DTO?, Error?]
   */
  static create(
    data: Record<string, string | number | Date | boolean>
  ): [AiConfigDTO?, DomainValidationError?] {
    const {
      id,
      chatModel,
      embeddingModel,
      temperature,
      maxTokens,
      batchEmbedding,
      createdAt,
      updatedAt,
    } = data;

    /* Validate required fields */
    if (
      !id ||
      !chatModel ||
      !embeddingModel ||
      temperature === undefined ||
      !maxTokens ||
      batchEmbedding === undefined ||
      !createdAt ||
      !updatedAt
    ) {
      return [undefined, new DomainValidationError('Invalid AI config data')];
    }

    /* Validate temperature range */
    const temp = Number(temperature);
    if (isNaN(temp) || temp < 0 || temp > 1) {
      return [
        undefined,
        new DomainValidationError('Temperature must be between 0 and 1'),
      ];
    }

    /* Validate max_tokens range */
    const tokens = Number(maxTokens);
    if (isNaN(tokens) || tokens < 1 || tokens > 200000) {
      return [
        undefined,
        new DomainValidationError('Max tokens must be between 1 and 200000'),
      ];
    }

    /* Validate batch_embedding is boolean */
    const batchEmbeddingBool = Boolean(batchEmbedding);

    return [
      new AiConfigDTO(
        id as string,
        chatModel as string,
        embeddingModel as string,
        temp,
        tokens,
        batchEmbeddingBool,
        createdAt as Date,
        updatedAt as Date
      ),
      undefined,
    ];
  }

  /**
   * Convert DTO to domain model
   *
   * @returns AiConfig domain model
   */
  public toDomain(): AiConfig {
    return {
      id: this.id,
      chatModel: this.chatModel,
      embeddingModel: this.embeddingModel,
      temperature: this.temperature,
      maxTokens: this.maxTokens,
      batchEmbedding: this.batchEmbedding,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      deletedAt: null,
    };
  }
}
