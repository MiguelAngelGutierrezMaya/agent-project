import {
  DocumentEmbedding,
  CreateDocumentEmbeddingData,
} from '@modules/documents/domain/models/DocumentEmbedding';

/**
 * Document Embedding Datasource Interface
 *
 * @description
 * Defines the contract for document embedding data operations.
 * Handles CRUD operations for document embeddings.
 */
export interface DocumentEmbeddingDatasource {
  /**
   * Create a new document embedding record
   * @param userId - Clerk user ID
   * @param data - Document embedding data
   * @returns Promise<DocumentEmbedding> - Created document embedding
   */
  createDocumentEmbedding(
    userId: string,
    data: CreateDocumentEmbeddingData
  ): Promise<DocumentEmbedding>;

  /**
   * Delete document embedding by document ID
   * @param userId - Clerk user ID
   * @param documentId - Document identifier
   * @returns Promise<void>
   */
  deleteDocumentEmbeddingByDocumentId(
    userId: string,
    documentId: string
  ): Promise<void>;
}
