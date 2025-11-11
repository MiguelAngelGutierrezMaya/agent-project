import { EmbeddingProcessingModeStrategy } from '@modules/embedding/domain/strategies/EmbeddingProcessingModeStrategy';

/**
 * Embedding Processing Mode Strategy Factory Interface
 *
 * @description
 * Factory interface for creating embedding processing mode strategies
 */
export interface EmbeddingProcessingModeStrategyFactory {
  /**
   * Get processing mode strategy by mode name
   *
   * @param modeName - Name of the processing mode
   * @returns Embedding processing mode strategy
   */
  getProcessingModeStrategy(modeName: string): EmbeddingProcessingModeStrategy;

  /**
   * Get all supported processing mode names
   *
   * @returns Array of supported processing mode names
   */
  getSupportedModeNames(): string[];

  /**
   * Check if a processing mode is supported
   *
   * @param modeName - Processing mode name to check
   * @returns True if processing mode is supported
   */
  isModeSupported(modeName: string): boolean;
}
