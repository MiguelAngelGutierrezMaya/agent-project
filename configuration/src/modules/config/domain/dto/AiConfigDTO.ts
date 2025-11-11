import { DomainValidationError } from '@src/infrastructure/shared/utils/errors/domain';
import type { AiConfig } from '@modules/config/domain/models/AiConfig';

/**
 * AI Configuration DTO
 *
 * @description
 * Data Transfer Object for AI model configuration.
 * Validates data from database before converting to domain model.
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
   * Create DTO from database record or API payload
   *
   * @param data Raw data (supports both snake_case from DB and camelCase from API)
   * @returns Tuple of [DTO?, Error?]
   */
  static create(
    data: Record<string, string | number | Date>
  ): [AiConfigDTO?, DomainValidationError?] {
    /* Support both camelCase (API) and snake_case (DB) */
    const id = data.id;
    const chatModel = (data.chatModel || data.chat_model) as string;
    const embeddingModel = (data.embeddingModel ||
      data.embedding_model) as string;
    const temperature = data.temperature;
    const maxTokens = data.maxTokens || data.max_tokens;
    const batchEmbedding =
      data.batchEmbedding !== undefined
        ? data.batchEmbedding
        : data.batch_embedding !== undefined
          ? data.batch_embedding
          : true;
    const createdAt = (data.createdAt || data.created_at) as Date;
    const updatedAt = (data.updatedAt || data.updated_at) as Date;

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
    if (
      typeof batchEmbedding !== 'boolean' &&
      batchEmbedding !== 0 &&
      batchEmbedding !== 1
    ) {
      return [
        undefined,
        new DomainValidationError('Batch embedding must be a boolean value'),
      ];
    }

    return [
      new AiConfigDTO(
        id as string,
        chatModel,
        embeddingModel,
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
