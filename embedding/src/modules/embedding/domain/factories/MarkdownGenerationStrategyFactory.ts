import { MarkdownGenerationStrategy } from '@modules/embedding/domain/strategies/MarkdownGenerationStrategy';

/**
 * Markdown Generation Strategy Factory Interface
 *
 * @description
 * Defines the contract for creating markdown generation strategies.
 * This interface abstracts the strategy creation logic from the application layer.
 *
 * @template T - The type of entity this factory handles
 */
export interface MarkdownGenerationStrategyFactory<T> {
  /**
   * Get strategy for a specific table name
   *
   * @param tableName - Table name (e.g., 'product_embeddings', 'document_embeddings')
   * @returns MarkdownGenerationStrategy instance
   * @throws Error if no strategy found for table name
   */
  getStrategy(tableName: string): MarkdownGenerationStrategy<T>;

  /**
   * Get all available table names
   *
   * @returns Array of supported table names
   */
  getSupportedTableNames(): string[];

  /**
   * Check if a table name is supported
   *
   * @param tableName - Table name to check
   * @returns boolean indicating if the table is supported
   */
  isTableSupported(tableName: string): boolean;
}
