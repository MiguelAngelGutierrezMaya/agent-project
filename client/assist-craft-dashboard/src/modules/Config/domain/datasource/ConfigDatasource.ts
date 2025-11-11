import type {
  Config,
  ConfigWithSchema,
} from '@/modules/Config/domain/models/Config';
import type { UserApiRequest } from '@/modules/shared/domain/interfaces/ApiRequest';

/**
 * Get Configuration Request
 */
export type GetConfigRequest = UserApiRequest;

/**
 * Update Configuration Request
 */
export interface UpdateConfigRequest extends UserApiRequest {
  /** Configuration data to update */
  config: Config;
}

/**
 * Configuration Datasource Interface
 * Defines the contract for data source operations
 */
export interface ConfigDatasource {
  /**
   * Retrieve configuration from the data source
   * @param request - Request object with user identifier and token
   * @returns Promise that resolves to configuration with schema information
   */
  getConfig(request: GetConfigRequest): Promise<ConfigWithSchema>;

  /**
   * Update configuration in the data source
   * @param request - Request object with user identifier, token, and config data
   * @returns Promise that resolves to updated configuration with schema information
   */
  updateConfig(request: UpdateConfigRequest): Promise<ConfigWithSchema>;
}
