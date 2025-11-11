import {
  Config,
  ConfigWithSchema,
} from '@src/modules/config/domain/models/Config';

/**
 * Interface for configuration data source operations
 * Defines contracts for configuration persistence operations
 */
export interface ConfigDatasource {
  /**
   * Retrieves configuration for a specific user with schema information
   * @param userId - User identifier for configuration retrieval
   * @returns Promise that resolves to configuration with schema information
   */
  getConfig(userId: string): Promise<ConfigWithSchema>;

  /**
   * Updates configuration for a specific user
   * @param userId - User identifier for configuration update
   * @param updateData - Configuration data to update
   * @returns Promise that resolves to the updated configuration with schema information
   */
  updateConfig(userId: string, updateData: Config): Promise<ConfigWithSchema>;
}
