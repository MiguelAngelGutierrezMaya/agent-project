import type { GetConfigRequest } from '@/modules/Config/domain/datasource/ConfigDatasource';
import type { ConfigRepository } from '@/modules/Config/domain/repositories/ConfigRepository';

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
   * @param request - Request object with user identifier and token
   * @returns Promise that resolves to configuration with schema information
   */
  async execute(request: GetConfigRequest) {
    return this.configRepository.getConfig(request);
  }
}
