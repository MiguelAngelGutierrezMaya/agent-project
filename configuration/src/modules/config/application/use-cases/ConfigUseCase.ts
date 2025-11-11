import { ConfigRepository } from '@modules/config/domain/repositories/ConfigRepository';
import { Config, ConfigWithSchema } from '@modules/config/domain/models/Config';

/**
 * Use case for retrieving configuration
 * Orchestrates the configuration retrieval business logic
 */
export class GetConfigUseCase {
  /**
   * Creates a new GetConfigUseCase instance
   * @param configRepository - The repository for configuration operations
   */
  constructor(private readonly configRepository: ConfigRepository) {}

  /**
   * Executes the configuration retrieval use case
   * @param userId - User identifier for configuration retrieval
   * @returns Promise that resolves to configuration with schema information
   */
  async execute(userId: string): Promise<ConfigWithSchema> {
    return this.configRepository.getConfig(userId);
  }
}

/**
 * Use case for updating configuration
 * Orchestrates the configuration update business logic
 */
export class UpdateConfigUseCase {
  /**
   * Creates a new UpdateConfigUseCase instance
   * @param configRepository - The repository for configuration operations
   */
  constructor(private readonly configRepository: ConfigRepository) {}

  /**
   * Executes the configuration update use case
   * @param userId - User identifier for configuration update
   * @param updateData - Configuration data to update
   * @returns Promise that resolves to the updated configuration with schema information
   */
  async execute(userId: string, updateData: Config): Promise<ConfigWithSchema> {
    return this.configRepository.updateConfig(userId, updateData);
  }
}
