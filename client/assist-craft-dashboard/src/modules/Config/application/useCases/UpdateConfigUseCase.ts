import type { UpdateConfigRequest } from '@/modules/Config/domain/datasource/ConfigDatasource';
import type { ConfigRepository } from '@/modules/Config/domain/repositories/ConfigRepository';

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
   * @param request - Request object with user identifier, token, and config data
   * @returns Promise that resolves to the updated configuration with schema information
   */
  async execute(request: UpdateConfigRequest) {
    return this.configRepository.updateConfig(request);
  }
}
