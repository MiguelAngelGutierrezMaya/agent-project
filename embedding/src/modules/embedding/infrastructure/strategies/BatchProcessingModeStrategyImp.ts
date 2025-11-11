import { EmbeddingProcessingModeStrategy } from '@modules/embedding/domain/strategies/EmbeddingProcessingModeStrategy';
import { EmbeddingProviderStrategy } from '@modules/embedding/domain/strategies/EmbeddingProviderStrategy';
import { EmbeddingProcessingMode } from '@modules/embedding/domain/models/EmbeddingProcessingMode';
import { EmbeddingResult } from '@modules/embedding/domain/models/EmbeddingResult';
import { EmbeddingProcessingItem } from '@modules/embedding/domain/models/EmbeddingProcessingItem';

/**
 * Batch Processing Mode Strategy
 *
 * @description
 * Processes embeddings in batches for better efficiency and cost reduction
 */
export class BatchProcessingModeStrategy
  implements EmbeddingProcessingModeStrategy
{
  readonly modeName = EmbeddingProcessingMode.BATCH;

  async processEmbeddings(
    items: EmbeddingProcessingItem[],
    provider: EmbeddingProviderStrategy
  ): Promise<EmbeddingResult[]> {
    // Process all items in a single batch
    return provider.generateBatchEmbeddings(items);
  }

  isSupportedForProvider(provider: EmbeddingProviderStrategy): boolean {
    // Batch processing is only supported if the provider supports it
    return provider.supportsBatchProcessing();
  }

  getMaxBatchSize(): number {
    // Batch processing can handle larger batches
    return 100;
  }
}
