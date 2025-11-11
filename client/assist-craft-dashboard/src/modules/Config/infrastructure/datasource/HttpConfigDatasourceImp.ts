import type {
  ConfigDatasource,
  GetConfigRequest,
  UpdateConfigRequest,
} from '@/modules/Config/domain/datasource/ConfigDatasource';
import type { ConfigWithSchema } from '@/modules/Config/domain/models/Config';

/**
 * API Response interface
 */
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

/**
 * HTTP Configuration Datasource Implementation
 * Communicates with the configuration service via REST API
 */
export class HttpConfigDatasourceImp implements ConfigDatasource {
  private readonly apiBaseUrl: string;

  /**
   * Creates a new HTTP Config Datasource instance
   * @param apiBaseUrl - Base URL for the configuration API
   */
  constructor(apiBaseUrl: string) {
    this.apiBaseUrl = apiBaseUrl;
  }

  /**
   * Get authorization headers with token
   * @param token - Authentication token
   * @returns Headers object with authorization
   */
  private getAuthHeaders(token: string): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
  }

  /**
   * Retrieve configuration from the API
   * @param request - Request object with user identifier and token
   * @returns Promise that resolves to configuration with schema information
   */
  async getConfig(request: GetConfigRequest): Promise<ConfigWithSchema> {
    try {
      const response = await fetch(
        `${this.apiBaseUrl}/config?userId=${request.userId}`,
        {
          method: 'GET',
          headers: this.getAuthHeaders(request.token),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to fetch configuration: ${response.status} ${errorText}`
        );
      }

      const data = (await response.json()) as ApiResponse<ConfigWithSchema>;

      if (!data.success || !data.data) {
        throw new Error('Invalid response format from API');
      }

      return data.data;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      console.error(
        '[HttpConfigDatasourceImp] Error fetching config:',
        errorMessage
      );
      throw error;
    }
  }

  /**
   * Update configuration via the API
   * @param request - Request object with user identifier, token, and config data
   * @returns Promise that resolves to updated configuration with schema information
   */
  async updateConfig(request: UpdateConfigRequest): Promise<ConfigWithSchema> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/config`, {
        method: 'PUT',
        headers: this.getAuthHeaders(request.token),
        body: JSON.stringify({ userId: request.userId, ...request.config }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to update configuration: ${response.status} ${errorText}`
        );
      }

      const data = (await response.json()) as ApiResponse<ConfigWithSchema>;

      if (!data.success || !data.data) {
        throw new Error('Invalid response format from API');
      }

      return data.data;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      console.error(
        '[HttpConfigDatasourceImp] Error updating config:',
        errorMessage
      );
      throw error;
    }
  }
}
