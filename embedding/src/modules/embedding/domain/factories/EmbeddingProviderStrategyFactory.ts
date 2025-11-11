import { EmbeddingProviderStrategy } from '@modules/embedding/domain/strategies/EmbeddingProviderStrategy';

/**
 * Embedding Provider Strategy Factory Interface
 *
 * @description
 * Factory interface for creating embedding provider strategies
 */
export interface EmbeddingProviderStrategyFactory {
  /**
   * Get provider strategy by model name
   *
   * @param modelName - Name of the model to get provider for
   * @returns Embedding provider strategy
   */
  getProviderStrategy(modelName: string): EmbeddingProviderStrategy;

  /**
   * Get all supported model names
   *
   * @returns Array of supported model names
   */
  getSupportedModelNames(): string[];

  /**
   * Check if a model is supported
   *
   * @param modelName - Model name to check
   * @returns True if model is supported
   */
  isModelSupported(modelName: string): boolean;
}
