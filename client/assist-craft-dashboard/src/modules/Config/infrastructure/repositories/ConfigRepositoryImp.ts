import type {
  ConfigDatasource,
  GetConfigRequest,
  UpdateConfigRequest,
} from '@/modules/Config/domain/datasource/ConfigDatasource';
import type { ConfigRepository } from '@/modules/Config/domain/repositories/ConfigRepository';

/**
 * Configuration Repository Implementation
 * Implements the repository pattern for configuration operations
 */
export class ConfigRepositoryImp implements ConfigRepository {
  /**
   * Creates a new ConfigRepositoryImp instance
   * @param configDatasource - The datasource for configuration operations
   */
  constructor(private readonly configDatasource: ConfigDatasource) {}

  /**
   * Retrieve configuration for a specific user
   * @param request - Request object with user identifier and token
   * @returns Promise that resolves to configuration with schema information
   */
  async getConfig(request: GetConfigRequest) {
    return this.configDatasource.getConfig(request);
  }

  /**
   * Update configuration for a specific user
   * @param request - Request object with user identifier, token, and config data
   * @returns Promise that resolves to updated configuration with schema information
   */
  async updateConfig(request: UpdateConfigRequest) {
    return this.configDatasource.updateConfig(request);
  }
}
