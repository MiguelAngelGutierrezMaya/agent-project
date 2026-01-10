import { Injectable, Logger } from '@nestjs/common';
import type { AIModelProvider } from '@src/modules/conversation/whatsapp/domain/models/AiModelProvider';
import { AzureOpenAIGpt4oMiniProvider } from './azure/azure-openai-gpt4o-mini.provider';
import { AzureOpenAIGpt41MiniProvider } from './azure/azure-openai-gpt41-mini.provider';

/**
 * Supported AI model types
 *
 * @description
 * Enum of all supported AI model providers.
 * This should match the values stored in client configuration.
 *
 * Azure Models:
 * - AZURE_OPENAI_GPT_4O_MINI: GPT-4o Mini (cost-effective, fast)
 * - AZURE_OPENAI_GPT_4O: GPT-4o (more capable, higher cost) - TODO
 * - AZURE_OPENAI_GPT_4: GPT-4 (most capable) - TODO
 *
 * Other Providers:
 * - OPENAI: Direct OpenAI API - TODO
 * - CLAUDE: Anthropic Claude - TODO
 * - GEMINI: Google Gemini - TODO
 */
export enum AIModelType {
  /* Azure OpenAI Models */
  AZURE_OPENAI_GPT_4O_MINI = 'azure-openai-gpt-4o-mini',
  AZURE_OPENAI_GPT_41_MINI = 'azure-openai-gpt-4.1-mini',
}

/**
 * AI Model Provider Factory
 *
 * @description
 * Factory that creates and returns the appropriate AI provider
 * based on the client's configuration.
 *
 * Benefits:
 * - Centralized provider creation logic
 * - Each client can use a different AI model
 * - Easy to add new providers without modifying existing code
 * - Provides fallback to default provider
 *
 * Usage:
 * ```typescript
 * const provider = await this.factory.getProvider(clientConfig.aiModel);
 * const response = await provider.generateResponse(request);
 * ```
 */
@Injectable()
export class AIModelProviderFactory {
  private readonly logger = new Logger(AIModelProviderFactory.name);
  private readonly defaultProvider: AIModelProvider;
  private readonly providers: Map<string, AIModelProvider>;

  constructor(
    private readonly azureOpenAIGpt4oMiniProvider: AzureOpenAIGpt4oMiniProvider,
    private readonly azureOpenAIGpt41MiniProvider: AzureOpenAIGpt41MiniProvider
  ) {
    /* Set default provider - GPT-4o Mini for cost-effectiveness */
    this.defaultProvider = this.azureOpenAIGpt4oMiniProvider;

    /* Initialize providers map */
    this.providers = new Map<string, AIModelProvider>([
      /* Azure OpenAI Models */
      [AIModelType.AZURE_OPENAI_GPT_4O_MINI, this.azureOpenAIGpt4oMiniProvider],
      [AIModelType.AZURE_OPENAI_GPT_41_MINI, this.azureOpenAIGpt41MiniProvider],
    ]);

    this.logger.log(
      `Initialized AIModelProviderFactory with ${this.providers.size} provider(s), default: ${this.defaultProvider.getProviderName()}`
    );
  }

  /**
   * Get AI provider based on model type
   *
   * @param modelType AI model type from client config (optional)
   * @returns AIModelProvider instance
   *
   * @description
   * Returns the appropriate provider for the requested model type.
   * If modelType is not provided or not recognized, returns the default provider.
   *
   * Uses Map for O(1) lookup performance and clean code (no switch).
   */
  getProvider(modelType?: string): AIModelProvider {
    /* Use default if no model type specified */
    if (!modelType) {
      this.logger.debug(
        `No model type specified, using default: ${this.defaultProvider.getProviderName()}`
      );
      return this.defaultProvider;
    }

    /* Get provider from map */
    const provider = this.providers.get(modelType);

    if (provider) {
      return provider;
    }

    /* Fallback to default if not found */
    this.logger.warn(
      `Provider '${modelType}' not found or not implemented, falling back to ${this.defaultProvider.getProviderName()}`
    );

    return this.defaultProvider;
  }

  /**
   * Get the default provider
   *
   * @returns Default AI provider
   */
  getDefaultProvider(): AIModelProvider {
    return this.defaultProvider;
  }

  /**
   * Get all registered providers
   *
   * @returns Array of provider names
   */
  getAvailableProviders(): string[] {
    return Array.from(this.providers.keys());
  }
}
