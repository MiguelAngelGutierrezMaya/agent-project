import { DocumentRepository } from '@modules/documents/domain/repositories/DocumentRepository';
import {
  Document,
  DocumentsResponse,
  DocumentData,
} from '@modules/documents/domain/models/Document';
import { DocumentDatasource } from '@modules/documents/domain/datasource/DocumentDatasource';

/**
 * Implementation of the DocumentRepository interface
 * Delegates document operations to the datasource layer
 */
export class DocumentRepositoryImp implements DocumentRepository {
  /**
   * Creates a new DocumentRepositoryImp instance
   * @param documentDatasource - The datasource implementation for document operations
   */
  constructor(private readonly documentDatasource: DocumentDatasource) {}

  /**
   * Retrieves paginated list of documents for a user
   * @param userId - User identifier for document retrieval
   * @param limit - Maximum number of documents to return
   * @param offset - Number of documents to skip for pagination
   * @returns Promise that resolves to paginated documents response
   */
  async getDocuments(
    userId: string,
    limit?: number,
    offset?: number
  ): Promise<DocumentsResponse> {
    return this.documentDatasource.getDocuments(userId, limit, offset);
  }

  /**
   * Creates a new document for a user
   * @param userId - User identifier for document creation
   * @param documentData - Document data to create
   * @returns Promise that resolves to the created document
   */
  async createDocument(
    userId: string,
    documentData: DocumentData
  ): Promise<Document> {
    return this.documentDatasource.createDocument(userId, documentData);
  }

  /**
   * Updates an existing document for a user
   * @param userId - User identifier for document update
   * @param documentData - Document data to update
   * @returns Promise that resolves to the updated document
   */
  async updateDocument(
    userId: string,
    documentData: Document
  ): Promise<Document> {
    return this.documentDatasource.updateDocument(userId, documentData);
  }

  /**
   * Deletes a document for a user
   * @param userId - User identifier for document deletion
   * @param documentId - Document identifier to delete
   * @returns Promise that resolves when deletion is complete
   */
  async deleteDocument(userId: string, documentId: string): Promise<void> {
    return this.documentDatasource.deleteDocument(userId, documentId);
  }
}
