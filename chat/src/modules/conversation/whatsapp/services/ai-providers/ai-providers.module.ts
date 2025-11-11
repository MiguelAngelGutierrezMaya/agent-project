import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ProvidersModule } from './providers/providers.module';
import { ToolsModule } from './tools/tools.module';
import { AIModelProviderFactory } from './providers/ai-model-provider.factory';
import { AzureOpenAIGpt4oMiniProvider } from './providers/azure/azure-openai-gpt4o-mini.provider';

/**
 * AI Providers Module
 *
 * @description
 * Orchestration module that combines ProvidersModule and ToolsModule.
 * This module provides:
 * - Access to all AI and embedding providers (via ProvidersModule)
 * - Access to all tool services (via ToolsModule)
 * - AI Model Provider Factory and AI providers (which depend on tools)
 *
 * Architecture:
 * - Imports ProvidersModule (embedding providers - no tool dependencies)
 * - Imports ToolsModule (all tool services)
 * - Registers AIModelProviderFactory and AI providers here (they need ToolsModule)
 * - Re-exports ProvidersModule exports for convenience
 *
 * Benefits:
 * - Single import point for ConversationModule
 * - Clear separation:
 *   * ProvidersModule: Embedding providers (infrastructure, no dependencies)
 *   * ToolsModule: Tool services (business logic)
 *   * This module: AI providers (need tools)
 * - No circular dependencies
 *
 * Usage:
 * Import this module in ConversationModule to get access to all AI and tool functionality.
 */
@Module({
  imports: [ProvidersModule, ToolsModule, ConfigModule],
  providers: [
    /* AI Model Provider Factory (depends on ToolsModule for services) */
    AIModelProviderFactory,

    /* AI Model Providers (depend on ToolsModule) */
    AzureOpenAIGpt4oMiniProvider,
  ],
  exports: [
    /* Export ProvidersModule exports (EmbeddingProviderFactory) */
    ProvidersModule,
    /* Export AI Model Provider Factory */
    AIModelProviderFactory,
  ],
})
export class AiProvidersModule {}
