import type { DeleteDocumentRequest } from '@/modules/training/documents/domain/datasource/DocumentDatasource';
import type { DocumentRepository } from '@/modules/training/documents/domain/repositories/DocumentRepository';

/**
 * Delete Document Use Case
 * Deletes a document for a user
 */
export class DeleteDocumentUseCase {
  /**
   * Creates a new DeleteDocumentUseCase instance
   * @param documentRepository - Repository for document data operations
   */
  constructor(private readonly documentRepository: DocumentRepository) {}

  /**
   * Execute the delete document use case
   * @param request - Request object with user identifier, token, and document id
   * @returns Promise that resolves when document is deleted
   */
  async execute(request: DeleteDocumentRequest): Promise<void> {
    return this.documentRepository.deleteDocument(request);
  }
}
