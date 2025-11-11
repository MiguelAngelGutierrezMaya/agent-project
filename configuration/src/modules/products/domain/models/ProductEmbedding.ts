/**
 * Product Embedding Model
 *
 * @description
 * Represents product embedding data for RAG system.
 * Stores markdown content and embedding vectors for semantic search.
 */
export interface ProductEmbedding {
  /**
   * Unique identifier
   */
  id: string;

  /**
   * Product identifier (foreign key)
   */
  productId: string;

  /**
   * Markdown content of the product for embedding
   * Contains product name, description, and details formatted as markdown
   */
  contentMarkdown: string;

  /**
   * Embedding vector (stored as string representation)
   * Will be null until embedding is generated
   */
  embedding?: string | null;

  /**
   * AI model used for generating the embedding
   * @example 'text-embedding-3-small', 'text-embedding-ada-002'
   */
  embeddingModel: string;

  /**
   * Status of the embedding generation
   * @example 'pending', 'processing', 'completed', 'failed'
   */
  embeddingStatus: 'pending' | 'processing' | 'completed' | 'failed';

  /**
   * Additional metadata for the embedding
   * Can store information about the embedding process
   */
  metadata?: Record<string, any>;

  /**
   * Record creation timestamp
   */
  createdAt: Date;

  /**
   * Last update timestamp
   */
  updatedAt: Date;
}

/**
 * Create Product Embedding Data
 * Used when creating a new product embedding record
 */
export interface CreateProductEmbeddingData {
  /**
   * Product identifier
   */
  productId: string;

  /**
   * Markdown content of the product
   */
  contentMarkdown: string;

  /**
   * AI model for embedding generation
   */
  embeddingModel: string;

  /**
   * Additional metadata
   */
  metadata?: Record<string, any>;
}
