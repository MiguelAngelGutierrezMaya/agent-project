import { MarkdownGenerationStrategyFactory } from '@modules/embedding/domain/factories/MarkdownGenerationStrategyFactory';
import { MarkdownGenerationStrategy } from '@modules/embedding/domain/strategies/MarkdownGenerationStrategy';
import { ProductEmbedding } from '@modules/embedding/domain/models/Product';
import { DocumentEmbedding } from '@modules/embedding/domain/models/Document';
import { ProductMarkdownStrategyImp } from '@modules/embedding/infrastructure/strategies/markdown/ProductMarkdownStrategyImp';
import { DocumentMarkdownStrategyImp } from '@modules/embedding/infrastructure/strategies/markdown/DocumentMarkdownStrategyImp';
import { DomainValidationError } from '@src/infrastructure/shared/utils/errors/domain';

type EmbeddingEntity = ProductEmbedding | DocumentEmbedding;

/**
 * Markdown Generation Strategy Factory Implementation
 *
 * @description
 * Infrastructure implementation of the MarkdownGenerationStrategyFactory interface.
 * Manages and provides the appropriate strategy for each table type.
 *
 * This implementation handles Product | Document union type for backward compatibility.
 *
 * Responsibilities:
 * - Register all available strategies
 * - Provide strategy instances based on table name
 * - Handle fallback for unknown table types
 * - Ensure single instance per strategy type (singleton pattern)
 */
export class MarkdownGenerationStrategyFactoryImp
  implements MarkdownGenerationStrategyFactory<EmbeddingEntity>
{
  private readonly strategies: Map<
    string,
    MarkdownGenerationStrategy<EmbeddingEntity>
  >;

  constructor() {
    this.strategies = new Map<
      string,
      MarkdownGenerationStrategy<EmbeddingEntity>
    >([
      ['product_embeddings', new ProductMarkdownStrategyImp()],
      ['document_embeddings', new DocumentMarkdownStrategyImp()],
    ]);
  }

  /**
   * Get strategy for a specific table name
   *
   * @param tableName - Table name (e.g., 'product_embeddings', 'document_embeddings')
   * @returns MarkdownGenerationStrategy instance
   * @throws Error if no strategy found for table name
   *
   * @description
   * Returns the appropriate strategy for the given table name.
   * Uses Map for O(1) lookup performance and clean code (no switch/if-else).
   */
  getStrategy(tableName: string): MarkdownGenerationStrategy<EmbeddingEntity> {
    const strategy = this.strategies.get(tableName);

    if (!strategy) {
      throw new DomainValidationError(
        `No markdown generation strategy found for table: ${tableName}`
      );
    }

    return strategy;
  }

  /**
   * Get all available table names
   *
   * @returns Array of supported table names
   */
  getSupportedTableNames(): string[] {
    return Array.from(this.strategies.keys());
  }

  /**
   * Check if a table name is supported
   *
   * @param tableName - Table name to check
   * @returns boolean indicating if the table is supported
   */
  isTableSupported(tableName: string): boolean {
    return this.strategies.has(tableName);
  }
}
