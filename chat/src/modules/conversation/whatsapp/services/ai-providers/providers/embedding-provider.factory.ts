import { Injectable, Logger } from '@nestjs/common';
import type { EmbeddingProvider } from '@src/modules/conversation/whatsapp/domain/models/EmbeddingProvider';
import { OpenAITextEmbeddingSmallProvider } from './openai/openai-text-embedding-small.provider';

/**
 * Supported embedding model names
 *
 * @description
 * Enum of all supported embedding model names.
 * These should match the values stored in client configuration.
 */
export enum EmbeddingModelName {
  /** OpenAI Text Embedding 3 Small */
  OPENAI_TEXT_EMBEDDING_3_SMALL = 'text-embedding-3-small',
}

/**
 * Embedding Provider Factory
 *
 * @description
 * Factory that creates and returns the appropriate embedding provider
 * based on the embedding model name from client configuration.
 *
 * Benefits:
 * - Centralized provider creation logic
 * - Each client can use a different embedding model
 * - Easy to add new providers without modifying existing code
 * - Provides fallback to default provider
 *
 * Usage:
 * ```typescript
 * const provider = this.factory.getProvider(embeddingModelName);
 * const embedding = await provider.generateEmbedding(query);
 * ```
 */
@Injectable()
export class EmbeddingProviderFactory {
  private readonly logger = new Logger(EmbeddingProviderFactory.name);
  private readonly defaultProvider: EmbeddingProvider;
  private readonly providers: Map<string, EmbeddingProvider>;

  constructor(
    private readonly openaiTextEmbeddingSmallProvider: OpenAITextEmbeddingSmallProvider
  ) {
    /* Set default provider - text-embedding-3-small for cost-effectiveness */
    this.defaultProvider = this.openaiTextEmbeddingSmallProvider;

    /* Initialize providers map */
    this.providers = new Map<string, EmbeddingProvider>([
      /* OpenAI Models */
      [
        EmbeddingModelName.OPENAI_TEXT_EMBEDDING_3_SMALL,
        this.openaiTextEmbeddingSmallProvider,
      ],
    ]);

    this.logger.log(
      `Initialized EmbeddingProviderFactory with ${this.providers.size} provider(s), default: ${this.defaultProvider.modelName}`
    );
  }

  /**
   * Get embedding provider based on model name
   *
   * @param modelName Embedding model name from client config (optional)
   * @returns EmbeddingProvider instance
   *
   * @description
   * Returns the appropriate provider for the requested model name.
   * If modelName is not provided or not recognized, returns the default provider.
   *
   * Uses Map for O(1) lookup performance and clean code (no switch).
   */
  getProvider(modelName?: string): EmbeddingProvider {
    /* Use default if no model name specified */
    if (!modelName) {
      this.logger.debug(
        `No embedding model specified, using default: ${this.defaultProvider.modelName}`
      );
      return this.defaultProvider;
    }

    /* Get provider from map */
    const provider = this.providers.get(modelName);

    if (provider) {
      return provider;
    }

    /* Fallback to default if not found */
    this.logger.warn(
      `Embedding provider '${modelName}' not found or not implemented, falling back to ${this.defaultProvider.modelName}`
    );

    return this.defaultProvider;
  }

  /**
   * Get the default provider
   *
   * @returns Default embedding provider
   */
  getDefaultProvider(): EmbeddingProvider {
    return this.defaultProvider;
  }
}
