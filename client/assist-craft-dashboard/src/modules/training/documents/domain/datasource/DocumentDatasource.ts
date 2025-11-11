import type { UserApiRequest } from '@/modules/shared/domain/interfaces/ApiRequest';
import type {
  Document,
  DocumentType,
  DocumentsResponse,
} from '@/modules/training/documents/domain/models/Document';

/**
 * Get Documents Request
 */
export interface GetDocumentsRequest extends UserApiRequest {
  limit?: number;
  offset?: number;
}

/**
 * Create Document Request
 */
export interface CreateDocumentRequest extends UserApiRequest {
  /** Document name */
  name: string;
  /** Document type (pdf or url) */
  type: DocumentType;
  /** Document URL or path */
  url: string;
  /** Whether document is embedded */
  isEmbedded?: boolean;
}

/**
 * Update Document Request
 */
export interface UpdateDocumentRequest extends UserApiRequest {
  /** Document identifier */
  id: string;
  /** Document name */
  name?: string;
  /** Document type (pdf or url) */
  type?: DocumentType;
  /** Document URL or path */
  url?: string;
  /** Whether document is embedded */
  isEmbedded?: boolean;
}

/**
 * Delete Document Request
 */
export interface DeleteDocumentRequest extends UserApiRequest {
  /** Document identifier */
  id: string;
}

/**
 * Document Datasource Interface
 * Defines the contract for data source operations
 */
export interface DocumentDatasource {
  /**
   * Retrieve documents from the data source
   * @param request - Request object with user identifier, token, and pagination options
   * @returns Promise that resolves to paginated documents response
   */
  getDocuments(request: GetDocumentsRequest): Promise<DocumentsResponse>;

  /**
   * Create a new document in the data source
   * @param request - Request object with user identifier, token, and document data
   * @returns Promise that resolves to created document
   */
  createDocument(request: CreateDocumentRequest): Promise<Document>;

  /**
   * Update a document in the data source
   * @param request - Request object with user identifier, token, document id, and update data
   * @returns Promise that resolves to updated document
   */
  updateDocument(request: UpdateDocumentRequest): Promise<Document>;

  /**
   * Delete a document from the data source
   * @param request - Request object with user identifier, token, and document id
   * @returns Promise that resolves when document is deleted
   */
  deleteDocument(request: DeleteDocumentRequest): Promise<void>;
}
