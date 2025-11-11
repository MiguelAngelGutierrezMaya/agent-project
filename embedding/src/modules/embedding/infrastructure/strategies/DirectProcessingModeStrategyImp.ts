import { EmbeddingProcessingModeStrategy } from '@modules/embedding/domain/strategies/EmbeddingProcessingModeStrategy';
import { EmbeddingProviderStrategy } from '@modules/embedding/domain/strategies/EmbeddingProviderStrategy';
import { EmbeddingProcessingMode } from '@modules/embedding/domain/models/EmbeddingProcessingMode';
import { EmbeddingResult } from '@modules/embedding/domain/models/EmbeddingResult';
import { EmbeddingProcessingItem } from '@modules/embedding/domain/models/EmbeddingProcessingItem';

/**
 * Direct Processing Mode Strategy
 *
 * @description
 * Processes embeddings one by one using direct API calls
 */
export class DirectProcessingModeStrategy
  implements EmbeddingProcessingModeStrategy
{
  readonly modeName = EmbeddingProcessingMode.DIRECT;

  async processEmbeddings(
    items: EmbeddingProcessingItem[],
    provider: EmbeddingProviderStrategy
  ): Promise<EmbeddingResult[]> {
    // Process all items using direct processing (the provider handles the loop)
    return provider.generateEmbeddings(items);
  }

  isSupportedForProvider(_provider: EmbeddingProviderStrategy): boolean {
    // Direct processing is supported by all providers
    return true;
  }

  getMaxBatchSize(): number {
    // Direct processing processes one text at a time
    return 1;
  }
}
