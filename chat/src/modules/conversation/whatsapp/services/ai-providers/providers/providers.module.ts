import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EmbeddingProviderFactory } from './embedding-provider.factory';
import { OpenAITextEmbeddingSmallProvider } from './openai/openai-text-embedding-small.provider';

/**
 * Providers Module
 *
 * @description
 * Centralized module for embedding provider implementations and their factory.
 * This module provides:
 * - Embedding Provider Factory (for semantic search)
 * - Individual embedding provider implementations (OpenAI, etc.)
 *
 * Architecture:
 * - Only embedding-related providers are registered here
 * - EmbeddingProviderFactory is exported so other modules can inject it
 * - Providers are registered but not exported (used internally by factory)
 * - This module has NO dependencies on tools or other business logic modules
 *
 * Benefits:
 * - Clean separation: embedding providers don't depend on tools
 * - No circular dependencies possible
 * - Easy to extend with new embedding providers
 *
 * Note: AI Model Providers (like AzureOpenAIGpt4oMiniProvider) are NOT here
 * because they depend on ToolsModule. They are registered in AiProvidersModule.
 *
 * Usage:
 * Import this module in any module that needs embedding providers.
 */
@Module({
  imports: [ConfigModule],
  providers: [
    /* Embedding Provider Factory */
    EmbeddingProviderFactory,

    /* Embedding Providers */
    OpenAITextEmbeddingSmallProvider,
  ],
  exports: [
    /* Export factory so other modules can inject it */
    EmbeddingProviderFactory,
  ],
})
export class ProvidersModule {}
