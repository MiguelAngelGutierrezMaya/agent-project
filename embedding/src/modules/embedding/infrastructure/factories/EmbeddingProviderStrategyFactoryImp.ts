import { EmbeddingProviderStrategyFactory } from '@modules/embedding/domain/factories/EmbeddingProviderStrategyFactory';
import { EmbeddingProviderStrategy } from '@modules/embedding/domain/strategies/EmbeddingProviderStrategy';
import { OpenAITextEmbeddingSmall } from '@modules/embedding/infrastructure/strategies/providers/OpenAITextEmbeddingSmallImp';
import { DomainValidationError } from '@src/infrastructure/shared/utils/errors/domain';
import { EmbeddingModelName } from '@modules/embedding/domain/models/EmbeddingModelName';

/**
 * Embedding Provider Strategy Factory Implementation
 *
 * @description
 * Implementation of the factory for creating embedding provider strategies
 */
export class EmbeddingProviderStrategyFactoryImp
  implements EmbeddingProviderStrategyFactory
{
  private readonly providers: Map<string, EmbeddingProviderStrategy>;

  constructor() {
    this.providers = new Map();
    this.initializeProviders();
  }

  getProviderStrategy(modelName: string): EmbeddingProviderStrategy {
    const provider = this.providers.get(modelName);
    if (!provider) {
      throw new DomainValidationError(
        `Unsupported embedding model: ${modelName}`
      );
    }
    return provider;
  }

  getSupportedModelNames(): string[] {
    return Array.from(this.providers.keys());
  }

  isModelSupported(modelName: string): boolean {
    return this.providers.has(modelName);
  }

  private initializeProviders(): void {
    // Initialize OpenAI providers
    this.providers.set(
      EmbeddingModelName.OPENAI_TEXT_EMBEDDING_3_SMALL,
      new OpenAITextEmbeddingSmall()
    );
  }
}
