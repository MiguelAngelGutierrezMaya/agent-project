import { ProductEmbedding } from '@modules/embedding/domain/models/Product';
import { EmbeddingResult } from '@modules/embedding/domain/models/EmbeddingResult';

/**
 * Product Datasource Interface
 *
 * @description
 * Defines the contract for product embedding data operations.
 * Handles queries for product embeddings that need processing.
 */
export interface ProductDatasource {
  /**
   * Get product embeddings that need embedding processing
   * @param schemaName - Schema name to query
   * @returns Promise<ProductEmbedding[]> - List of product embeddings
   */
  getPendingEmbeddings(schemaName: string): Promise<ProductEmbedding[]>;

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
   * Get product embeddings that are in processing state with batch_id
   * @param schemaName - Schema name to query
   * @returns Promise<ProductEmbedding[]> - List of product embeddings in processing state
   */
  getProcessingEmbeddingsWithBatchId(
    schemaName: string
  ): Promise<ProductEmbedding[]>;

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
