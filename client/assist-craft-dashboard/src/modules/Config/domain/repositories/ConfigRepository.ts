import type {
  GetConfigRequest,
  UpdateConfigRequest,
} from '@/modules/Config/domain/datasource/ConfigDatasource';
import type { ConfigWithSchema } from '@/modules/Config/domain/models/Config';

/**
 * Configuration Repository Interface
 * Defines the contract for configuration data operations
 */
export interface ConfigRepository {
  /**
   * Retrieve configuration for a specific user
   * @param request - Request object with user identifier and token
   * @returns Promise that resolves to configuration with schema information
   */
  getConfig(request: GetConfigRequest): Promise<ConfigWithSchema>;

  /**
   * Update configuration for a specific user
   * @param request - Request object with user identifier, token, and config data
   * @returns Promise that resolves to updated configuration with schema information
   */
  updateConfig(request: UpdateConfigRequest): Promise<ConfigWithSchema>;
}
