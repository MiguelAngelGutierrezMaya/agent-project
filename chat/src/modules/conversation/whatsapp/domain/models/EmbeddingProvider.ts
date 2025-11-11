/**
 * Embedding Provider Interface
 *
 * @description
 * Defines the contract for all embedding providers (OpenAI, Azure OpenAI, etc.).
 * Each provider implements this interface to handle embedding generation for semantic search.
 *
 * Benefits:
 * - Single Responsibility: Each provider handles one embedding service
 * - Open/Closed Principle: Add new providers without modifying existing code
 * - Testability: Easy to mock and unit test individual providers
 */

/**
 * Embedding Provider Interface
 */
export interface EmbeddingProvider {
  /**
   * Provider name identifier
   */
  readonly providerName: string;

  /**
   * Model name used by this provider
   */
  readonly modelName: string;

  /**
   * Generate embedding vector for a text query
   *
   * @param text Text to generate embedding for
   * @returns Promise with embedding vector array or null if generation fails
   *
   * @description
   * Generates a single embedding vector for the provided text.
   * The embedding vector can be used for semantic search in the database.
   *
   * Should handle errors gracefully and return null if generation fails.
   */
  generateEmbedding(text: string): Promise<number[] | null>;
}
