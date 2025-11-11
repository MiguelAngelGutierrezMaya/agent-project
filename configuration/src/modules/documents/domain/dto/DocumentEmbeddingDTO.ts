import { DomainValidationError } from '@src/infrastructure/shared/utils/errors/domain';
import type { DocumentEmbedding } from '@modules/documents/domain/models/DocumentEmbedding';

/**
 * Document Embedding DTO
 *
 * @description
 * Data Transfer Object for document embedding data.
 * Validates data from database before converting to domain model.
 */
export class DocumentEmbeddingDTO {
  constructor(
    public readonly id: string,
    public readonly documentId: string,
    public readonly contentMarkdown: string,
    public readonly embedding: string | null,
    public readonly embeddingModel: string,
    public readonly embeddingStatus:
      | 'pending'
      | 'processing'
      | 'completed'
      | 'failed',
    public readonly metadata: Record<string, any>,
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
    data: Record<string, string | number | Date | object | null>
  ): [DocumentEmbeddingDTO?, DomainValidationError?] {
    /* Support both camelCase (API) and snake_case (DB) */
    const id = data.id;
    const documentId = (data.documentId || data.document_id) as string;
    const contentMarkdown = (data.contentMarkdown ||
      data.content_markdown) as string;
    const embedding = data.embedding as string | null;
    const embeddingModel = (data.embeddingModel ||
      data.embedding_model) as string;
    const embeddingStatus = (data.embeddingStatus ||
      data.embedding_status) as string;
    const metadata = (data.metadata || {}) as Record<string, any>;
    const createdAt = (data.createdAt || data.created_at) as Date;
    const updatedAt = (data.updatedAt || data.updated_at) as Date;

    /* Validate required fields */
    if (
      !id ||
      !documentId ||
      contentMarkdown === undefined ||
      contentMarkdown === null ||
      !embeddingModel ||
      !embeddingStatus ||
      !createdAt ||
      !updatedAt
    ) {
      return [
        undefined,
        new DomainValidationError('Invalid document embedding data'),
      ];
    }

    /* Validate embedding status */
    const validStatuses = ['pending', 'processing', 'completed', 'failed'];
    if (!validStatuses.includes(embeddingStatus)) {
      return [
        undefined,
        new DomainValidationError(
          'Invalid embedding status. Must be one of: pending, processing, completed, failed'
        ),
      ];
    }

    /* Validate metadata is object */
    if (metadata && typeof metadata !== 'object') {
      return [
        undefined,
        new DomainValidationError('Metadata must be an object'),
      ];
    }

    return [
      new DocumentEmbeddingDTO(
        id as string,
        documentId,
        contentMarkdown,
        embedding,
        embeddingModel,
        embeddingStatus as 'pending' | 'processing' | 'completed' | 'failed',
        metadata,
        createdAt as Date,
        updatedAt as Date
      ),
      undefined,
    ];
  }

  /**
   * Convert DTO to domain model
   *
   * @returns DocumentEmbedding domain model
   */
  public toDomain(): DocumentEmbedding {
    return {
      id: this.id,
      documentId: this.documentId,
      contentMarkdown: this.contentMarkdown,
      embedding: this.embedding,
      embeddingModel: this.embeddingModel,
      embeddingStatus: this.embeddingStatus,
      metadata: this.metadata,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
