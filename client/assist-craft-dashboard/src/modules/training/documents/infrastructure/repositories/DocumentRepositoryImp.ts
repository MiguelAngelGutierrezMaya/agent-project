import type {
  DocumentDatasource,
  GetDocumentsRequest,
  CreateDocumentRequest,
  UpdateDocumentRequest,
  DeleteDocumentRequest,
} from '@/modules/training/documents/domain/datasource/DocumentDatasource';
import type { DocumentRepository } from '@/modules/training/documents/domain/repositories/DocumentRepository';

/**
 * Document Repository Implementation
 * Delegates operations to the datasource layer
 */
export class DocumentRepositoryImp implements DocumentRepository {
  /**
   * Creates a new DocumentRepositoryImp instance
   * @param documentDatasource - The datasource implementation for document operations
   */
  constructor(private readonly documentDatasource: DocumentDatasource) {}

  /**
   * Retrieve documents
   * @param request - Request object with user identifier, token, and pagination options
   * @returns Promise that resolves to paginated documents response
   */
  async getDocuments(request: GetDocumentsRequest) {
    return this.documentDatasource.getDocuments(request);
  }

  /**
   * Create a new document
   * @param request - Request object with user identifier, token, and document data
   * @returns Promise that resolves to created document
   */
  async createDocument(request: CreateDocumentRequest) {
    return this.documentDatasource.createDocument(request);
  }

  /**
   * Update a document
   * @param request - Request object with user identifier, token, document id, and update data
   * @returns Promise that resolves to updated document
   */
  async updateDocument(request: UpdateDocumentRequest) {
    return this.documentDatasource.updateDocument(request);
  }

  /**
   * Delete a document
   * @param request - Request object with user identifier, token, and document id
   * @returns Promise that resolves when document is deleted
   */
  async deleteDocument(request: DeleteDocumentRequest) {
    return this.documentDatasource.deleteDocument(request);
  }
}
