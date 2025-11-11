import type { CreateDocumentRequest } from '@/modules/training/documents/domain/datasource/DocumentDatasource';
import type { Document } from '@/modules/training/documents/domain/models/Document';
import type { DocumentRepository } from '@/modules/training/documents/domain/repositories/DocumentRepository';

/**
 * Create Document Use Case
 * Creates a new document for a user
 */
export class CreateDocumentUseCase {
  /**
   * Creates a new CreateDocumentUseCase instance
   * @param documentRepository - Repository for document data operations
   */
  constructor(private readonly documentRepository: DocumentRepository) {}

  /**
   * Execute the create document use case
   * @param request - Request object with user identifier, token, and document data
   * @returns Promise that resolves to created document
   */
  async execute(request: CreateDocumentRequest): Promise<Document> {
    return this.documentRepository.createDocument(request);
  }
}
