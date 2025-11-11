/**
 * Document Embedding Model
 *
 * @description
 * Represents document embedding data for RAG system.
 * Stores markdown content and embedding vectors for semantic search.
 */
export interface DocumentEmbedding {
  /**
   * Unique identifier
   */
  id: string;

  /**
   * Document identifier (foreign key)
   */
  documentId: string;

  /**
   * Markdown content of the document for embedding
   * Contains document name, type, and URL formatted as markdown
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
 * Create Document Embedding Data
 * Used when creating a new document embedding record
 */
export interface CreateDocumentEmbeddingData {
  /**
   * Document identifier
   */
  documentId: string;

  /**
   * Markdown content of the document
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
