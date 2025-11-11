import type {
  GetDocumentsRequest,
  CreateDocumentRequest,
  UpdateDocumentRequest,
  DeleteDocumentRequest,
} from '@/modules/training/documents/domain/datasource/DocumentDatasource';
import type {
  Document,
  DocumentsResponse,
} from '@/modules/training/documents/domain/models/Document';

/**
 * Document Repository Interface
 * Defines the contract for document data operations
 */
export interface DocumentRepository {
  /**
   * Retrieve documents
   * @param request - Request object with user identifier, token, and pagination options
   * @returns Promise that resolves to paginated documents response
   */
  getDocuments(request: GetDocumentsRequest): Promise<DocumentsResponse>;

  /**
   * Create a new document
   * @param request - Request object with user identifier, token, and document data
   * @returns Promise that resolves to created document
   */
  createDocument(request: CreateDocumentRequest): Promise<Document>;

  /**
   * Update a document
   * @param request - Request object with user identifier, token, document id, and update data
   * @returns Promise that resolves to updated document
   */
  updateDocument(request: UpdateDocumentRequest): Promise<Document>;

  /**
   * Delete a document
   * @param request - Request object with user identifier, token, and document id
   * @returns Promise that resolves when document is deleted
   */
  deleteDocument(request: DeleteDocumentRequest): Promise<void>;
}
