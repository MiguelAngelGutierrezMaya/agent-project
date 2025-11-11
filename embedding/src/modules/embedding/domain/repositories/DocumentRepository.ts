import { DocumentEmbedding } from '@modules/embedding/domain/models/Document';
import { EmbeddingResult } from '@modules/embedding/domain/models/EmbeddingResult';

/**
 * Document Repository Interface
 *
 * @description
 * Defines the contract for interacting with document embedding data.
 * This layer abstracts the underlying data source from the application logic.
 */
export interface DocumentRepository {
  /**
   * Retrieves document embeddings that are pending embedding generation.
   *
   * @param schemaName - The schema name to query for document embeddings.
   * @returns A promise that resolves to an array of DocumentEmbedding objects.
   */
  getPendingEmbeddings(schemaName: string): Promise<DocumentEmbedding[]>;

  /**
   * Store embeddings in the database
   *
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
   * Retrieves document embeddings that are in processing state with batch_id
   *
   * @param schemaName - The schema name to query for document embeddings
   * @returns A promise that resolves to an array of DocumentEmbedding objects in processing state
   */
  getProcessingEmbeddingsWithBatchId(
    schemaName: string
  ): Promise<DocumentEmbedding[]>;

  /**
   * Update completed embeddings (only embedding vector, status, and updated_at)
   * Used when retrieving embeddings from batch processing
   *
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
