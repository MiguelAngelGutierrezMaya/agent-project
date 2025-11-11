/**
 * AI Configuration Model
 *
 * @description
 * Represents AI model configuration for chat and embeddings.
 * Controls which AI provider to use and how responses are generated.
 */
export interface AiConfig {
  /**
   * Unique identifier
   */
  id: string;

  /**
   * AI model for chat completions
   * @example 'azure-openai', 'openai', 'claude', 'gemini'
   */
  chatModel: string;

  /**
   * AI model for text embeddings
   * @example 'text-embedding-ada-002'
   */
  embeddingModel: string;

  /**
   * AI response temperature (0-1)
   * Lower values = more deterministic
   * Higher values = more creative
   */
  temperature: number;

  /**
   * Maximum tokens for AI responses
   * Ranges from 1 to 4000
   */
  maxTokens: number;

  /**
   * Whether to generate embeddings in batch mode
   * true = batch mode (more cost-effective, async)
   * false = direct mode (immediate, synchronous)
   */
  batchEmbedding: boolean;

  /**
   * Record creation timestamp
   */
  createdAt?: Date;

  /**
   * Last update timestamp
   */
  updatedAt?: Date;

  /**
   * Soft delete timestamp
   */
  deletedAt?: Date | null;
}
