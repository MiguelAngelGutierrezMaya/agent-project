import { EmbeddingResult } from '@modules/embedding/domain/models/EmbeddingResult';
import { EmbeddingProcessingItem } from '@modules/embedding/domain/models/EmbeddingProcessingItem';

/**
 * Embedding Provider Strategy Interface
 *
 * @description
 * Base interface for embedding provider strategies
 */
export interface EmbeddingProviderStrategy {
  /**
   * Provider name
   */
  readonly providerName: string;

  /**
   * Model name used by this provider
   */
  readonly modelName: string;

  /**
   * Generate embeddings for multiple items using direct processing (one-by-one)
   *
   * @param items - Array of processing items with markdown and entity context
   * @returns Promise with array of embedding results containing all embeddings and metadata
   */
  generateEmbeddings(
    items: EmbeddingProcessingItem[]
  ): Promise<EmbeddingResult[]>;

  /**
   * Generate embeddings for multiple items using batch processing (parallel)
   *
   * @param items - Array of processing items with markdown and entity context
   * @returns Promise with array of embedding results containing all embeddings and metadata
   */
  generateBatchEmbeddings(
    items: EmbeddingProcessingItem[]
  ): Promise<EmbeddingResult[]>;

  /**
   * Check if batch processing is supported
   *
   * @returns True if batch processing is supported
   */
  supportsBatchProcessing(): boolean;

  /**
   * Retrieve embeddings for a batch that was previously submitted
   *
   * @param batchId - The batch ID from the embedding provider
   * @param itemIds - Array of entity IDs that belong to this batch
   * @param schemaName - Schema name where the entities exist
   * @param entityType - Entity type (table name: product_embeddings or document_embeddings)
   * @returns Promise with array of embedding results containing vectors and metadata
   */
  getBatchEmbeddings(
    batchId: string,
    itemIds: string[],
    schemaName: string,
    entityType: string
  ): Promise<EmbeddingResult[]>;
}
