import { ConfigRepository } from '@modules/config/domain/repositories/ConfigRepository';
import { Config, ConfigWithSchema } from '@modules/config/domain/models/Config';
import { ConfigDatasource } from '@modules/config/domain/datasource/ConfigDatasource';

/**
 * Implementation of the ConfigRepository interface
 * Delegates configuration operations to the datasource layer
 */
export class ConfigRepositoryImp implements ConfigRepository {
  /**
   * Creates a new ConfigRepositoryImp instance
   * @param configDatasource - The datasource implementation for configuration operations
   */
  constructor(private readonly configDatasource: ConfigDatasource) {}

  /**
   * Retrieves configuration for a specific user with schema information
   * @param userId - User identifier for configuration retrieval
   * @returns Promise that resolves to configuration with schema information
   */
  async getConfig(userId: string): Promise<ConfigWithSchema> {
    return this.configDatasource.getConfig(userId);
  }

  /**
   * Updates configuration for a specific user
   * @param userId - User identifier for configuration update
   * @param updateData - Configuration data to update
   * @returns Promise that resolves to the updated configuration with schema information
   */
  async updateConfig(
    userId: string,
    updateData: Config
  ): Promise<ConfigWithSchema> {
    return this.configDatasource.updateConfig(userId, updateData);
  }
}
