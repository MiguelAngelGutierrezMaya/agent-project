import {
  Document,
  DocumentsResponse,
  DocumentData,
} from '@modules/documents/domain/models/Document';

/**
 * Interface for document repository operations
 * Defines contracts for document business logic operations
 */
export interface DocumentRepository {
  /**
   * Retrieves paginated list of documents for a user
   * @param userId - User identifier for document retrieval
   * @param limit - Maximum number of documents to return
   * @param offset - Number of documents to skip for pagination
   * @returns Promise that resolves to paginated documents response
   */
  getDocuments(
    userId: string,
    limit?: number,
    offset?: number
  ): Promise<DocumentsResponse>;

  /**
   * Creates a new document for a user
   * @param userId - User identifier for document creation
   * @param documentData - Document data to create
   * @returns Promise that resolves to the created document
   */
  createDocument(userId: string, documentData: DocumentData): Promise<Document>;

  /**
   * Updates an existing document for a user
   * @param userId - User identifier for document update
   * @param documentData - Document data to update
   * @returns Promise that resolves to the updated document
   */
  updateDocument(userId: string, documentData: Document): Promise<Document>;

  /**
   * Deletes a document for a user
   * @param userId - User identifier for document deletion
   * @param documentId - Document identifier to delete
   * @returns Promise that resolves when deletion is complete
   */
  deleteDocument(userId: string, documentId: string): Promise<void>;
}
