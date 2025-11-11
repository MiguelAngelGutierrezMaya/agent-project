/**
 * AI Configuration for Embedding Processing
 *
 * @description
 * Configuration needed for embedding generation per schema.
 * Contains model settings, batch processing preferences, and vector dimensions.
 */
export interface EmbeddingConfig {
  /**
   * Schema name where the configuration applies
   */
  schemaName: string;

  /**
   * Embedding model to use for generating vectors
   * @example 'text-embedding-3-small', 'text-embedding-ada-002'
   */
  embeddingModel: string;

  /**
   * Whether to use batch processing for cost optimization
   * Batch processing can reduce costs by up to 50%
   */
  batchEmbedding: boolean;

  /**
   * Vector dimensions for the embedding model
   * Determines the size of the generated embedding vectors
   */
  vectorDimensions: number;
}
