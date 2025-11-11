import { DocumentEmbedding } from '@modules/embedding/domain/models/Document';
import { EmbeddingResult } from '@modules/embedding/domain/models/EmbeddingResult';

/**
 * Document Datasource Interface
 *
 * @description
 * Defines the contract for document embedding data operations.
 * Handles queries for document embeddings that need processing.
 */
export interface DocumentDatasource {
  /**
   * Get document embeddings that need embedding processing
   * @param schemaName - Schema name to query
   * @returns Promise<DocumentEmbedding[]> - List of document embeddings
   */
  getPendingEmbeddings(schemaName: string): Promise<DocumentEmbedding[]>;

  /**
   * Store embeddings in the database
   * @param embeddings - Array of embedding results to store
   * @param schemaName - Schema name where the entities exist
   * @param embeddingModel - Model name used for the embedding
   * @returns Promise<void>
   */
  storeEmbeddings(
    embeddings: EmbeddingResult[],
    schemaName: string,
    embeddingModel: string
  ): Promise<void>;

  /**
   * Get document embeddings that are in processing state with batch_id
   * @param schemaName - Schema name to query
   * @returns Promise<DocumentEmbedding[]> - List of document embeddings in processing state
   */
  getProcessingEmbeddingsWithBatchId(
    schemaName: string
  ): Promise<DocumentEmbedding[]>;

  /**
   * Update completed embeddings (only embedding vector, status, and updated_at)
   * Used when retrieving embeddings from batch processing
   * @param embeddings - Array of embedding results to update (must have non-null embedding)
   * @param schemaName - Schema name where the entities exist
   * @param embeddingModel - Model name used for the embedding
   * @returns Promise<void>
   */
  updateCompletedEmbeddings(
    embeddings: EmbeddingResult[],
    schemaName: string,
    embeddingModel: string
  ): Promise<void>;
}
