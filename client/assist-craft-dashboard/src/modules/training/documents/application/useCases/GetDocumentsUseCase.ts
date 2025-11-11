import type { GetDocumentsRequest } from '@/modules/training/documents/domain/datasource/DocumentDatasource';
import type { DocumentsResponse } from '@/modules/training/documents/domain/models/Document';
import type { DocumentRepository } from '@/modules/training/documents/domain/repositories/DocumentRepository';

/**
 * Get Documents Use Case
 * Retrieves a paginated list of documents for a user
 */
export class GetDocumentsUseCase {
  /**
   * Creates a new GetDocumentsUseCase instance
   * @param documentRepository - Repository for document data operations
   */
  constructor(private readonly documentRepository: DocumentRepository) {}

  /**
   * Execute the get documents use case
   * @param request - Request object with user identifier, token, and pagination options
   * @returns Promise that resolves to paginated documents response
   */
  async execute(request: GetDocumentsRequest): Promise<DocumentsResponse> {
    return this.documentRepository.getDocuments(request);
  }
}
