import { EmbeddingProviderStrategy } from '@modules/embedding/domain/strategies/EmbeddingProviderStrategy';
import { EmbeddingResult } from '@modules/embedding/domain/models/EmbeddingResult';
import { EmbeddingProcessingItem } from '@modules/embedding/domain/models/EmbeddingProcessingItem';

/**
 * Embedding Processing Mode Strategy Interface
 *
 * @description
 * Base interface for embedding processing mode strategies
 */
export interface EmbeddingProcessingModeStrategy {
  /**
   * Processing mode name
   */
  readonly modeName: string;

  /**
   * Process embeddings using the specified mode with processing items
   *
   * @param items - Array of processing items with markdown and entity context
   * @param provider - Embedding provider strategy to use
   * @returns Promise with array of embedding results containing vectors and metadata
   */
  processEmbeddings(
    items: EmbeddingProcessingItem[],
    provider: EmbeddingProviderStrategy
  ): Promise<EmbeddingResult[]>;

  /**
   * Check if this mode is supported for the given provider
   *
   * @param provider - Provider to check support for
   * @returns True if mode is supported for the provider
   */
  isSupportedForProvider(provider: EmbeddingProviderStrategy): boolean;

  /**
   * Get the maximum batch size for this processing mode
   *
   * @returns Maximum number of texts that can be processed in a single batch
   */
  getMaxBatchSize(): number;
}
