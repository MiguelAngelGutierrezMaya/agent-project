import { EmbeddingProcessingModeStrategyFactory } from '@modules/embedding/domain/factories/EmbeddingProcessingModeStrategyFactory';
import { EmbeddingProcessingModeStrategy } from '@modules/embedding/domain/strategies/EmbeddingProcessingModeStrategy';
import { DirectProcessingModeStrategy } from '@modules/embedding/infrastructure/strategies/DirectProcessingModeStrategyImp';
import { BatchProcessingModeStrategy } from '@modules/embedding/infrastructure/strategies/BatchProcessingModeStrategyImp';
import { DomainValidationError } from '@src/infrastructure/shared/utils/errors/domain';
import { EmbeddingProcessingMode } from '@modules/embedding/domain/models/EmbeddingProcessingMode';

/**
 * Embedding Processing Mode Strategy Factory Implementation
 *
 * @description
 * Implementation of the factory for creating embedding processing mode strategies
 */
export class EmbeddingProcessingModeStrategyFactoryImp
  implements EmbeddingProcessingModeStrategyFactory
{
  private readonly processingModes: Map<
    string,
    EmbeddingProcessingModeStrategy
  >;

  constructor() {
    this.processingModes = new Map();
    this.initializeProcessingModes();
  }

  getProcessingModeStrategy(modeName: string): EmbeddingProcessingModeStrategy {
    const mode = this.processingModes.get(modeName);
    if (!mode) {
      throw new DomainValidationError(
        `Unsupported processing mode: ${modeName}`
      );
    }
    return mode;
  }

  getSupportedModeNames(): string[] {
    return Array.from(this.processingModes.keys());
  }

  isModeSupported(modeName: string): boolean {
    return this.processingModes.has(modeName);
  }

  private initializeProcessingModes(): void {
    // Initialize processing modes
    this.processingModes.set(
      EmbeddingProcessingMode.DIRECT,
      new DirectProcessingModeStrategy()
    );
    this.processingModes.set(
      EmbeddingProcessingMode.BATCH,
      new BatchProcessingModeStrategy()
    );
  }
}
