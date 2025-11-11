import { DomainValidationError } from '@src/infrastructure/shared/utils/errors/domain';
import type {
  DocumentEmbedding,
  DatabaseDocumentEmbeddingData,
} from '@modules/embedding/domain/models/Document';
import { DocumentDTO } from '@modules/embedding/domain/dto/DocumentDTO';

/**
 * Document Embedding DTO
 *
 * @description
 * Data Transfer Object for document embedding data including the document information.
 * This is the main DTO for embedding operations.
 */
export class DocumentEmbeddingDTO {
  constructor(
    public readonly id: string,
    public readonly documentId: string,
    public readonly markdownContent: string,
    public readonly embeddingStatus: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly document: DocumentDTO,
    public readonly embedding?: number[],
    public readonly embeddingModel?: string,
    public readonly batchId?: string
  ) {}

  /**
   * Create DTO from database record
   *
   * @param data Raw data from database
   * @returns Tuple of [DTO?, Error?]
   */
  static create(
    data: DatabaseDocumentEmbeddingData
  ): [DocumentEmbeddingDTO?, DomainValidationError?] {
    const id = data.id;
    const documentId = data.document_id;
    const markdownContent = data.content_markdown;
    const embeddingStatus = data.embedding_status;
    const embedding = data.embedding;
    const embeddingModel = data.embedding_model;
    const batchId = data.batch_id;

    // Parse dates with validation
    const createdAt = new Date(data.created_at);
    const updatedAt = new Date(data.updated_at);

    /* Validate ONLY required fields from database schema */
    if (!id || !documentId || !embeddingStatus) {
      return [
        undefined,
        new DomainValidationError(
          'Invalid document embedding data: missing required fields (id, document_id, embedding_status)'
        ),
      ];
    }

    /* Validate dates are valid */
    if (isNaN(createdAt.getTime()) || isNaN(updatedAt.getTime())) {
      return [
        undefined,
        new DomainValidationError(
          'Invalid document embedding data: invalid date values'
        ),
      ];
    }

    // Build document DTO (REQUIRED)
    const [documentDTO, documentError] = DocumentDTO.create({
      id: documentId,
      name: data.document_name || '',
      type: data.document_type || '',
      url: data.document_url || '',
      is_embedded: data.document_is_embedded || false,
      created_at: data.document_created_at
        ? new Date(data.document_created_at)
        : new Date(),
      updated_at: data.document_updated_at
        ? new Date(data.document_updated_at)
        : new Date(),
    });

    if (documentError || !documentDTO) {
      return [
        undefined,
        documentError ||
          new DomainValidationError('Failed to create document DTO'),
      ];
    }

    return [
      new DocumentEmbeddingDTO(
        id,
        documentId,
        markdownContent,
        embeddingStatus,
        createdAt,
        updatedAt,
        documentDTO,
        embedding,
        embeddingModel,
        batchId
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
      document: this.document.toDomain(),
      markdown: this.markdownContent,
      embeddingModel: this.embeddingModel,
      batchId: this.batchId,
      embeddingStatus: this.embeddingStatus,
    };
  }
}
