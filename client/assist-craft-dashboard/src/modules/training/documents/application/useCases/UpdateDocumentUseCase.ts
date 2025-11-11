import type { UpdateDocumentRequest } from '@/modules/training/documents/domain/datasource/DocumentDatasource';
import type { Document } from '@/modules/training/documents/domain/models/Document';
import type { DocumentRepository } from '@/modules/training/documents/domain/repositories/DocumentRepository';

/**
 * Update Document Use Case
 * Updates an existing document for a user
 */
export class UpdateDocumentUseCase {
  /**
   * Creates a new UpdateDocumentUseCase instance
   * @param documentRepository - Repository for document data operations
   */
  constructor(private readonly documentRepository: DocumentRepository) {}

  /**
   * Execute the update document use case
   * @param request - Request object with user identifier, token, document id, and update data
   * @returns Promise that resolves to updated document
   */
  async execute(request: UpdateDocumentRequest): Promise<Document> {
    return this.documentRepository.updateDocument(request);
  }
}
