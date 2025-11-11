import { GetConfigUseCase } from '@/modules/Config/application/useCases/GetConfigUseCase';
import { GetConfigWithCacheUseCase } from '@/modules/Config/application/useCases/GetConfigWithCacheUseCase';
import { UpdateConfigUseCase } from '@/modules/Config/application/useCases/UpdateConfigUseCase';
import type {
  GetConfigRequest,
  UpdateConfigRequest,
} from '@/modules/Config/domain/datasource/ConfigDatasource';
import { HttpConfigDatasourceImp } from '@/modules/Config/infrastructure/datasource/HttpConfigDatasourceImp';
import { ConfigRepositoryImp } from '@/modules/Config/infrastructure/repositories/ConfigRepositoryImp';
import { LocalStorageConfigStorageRepositoryImp } from '@/modules/Config/infrastructure/repositories/LocalStorageConfigStorageRepositoryImp';

/**
 * Configuration Service
 * Orchestrates configuration operations using use cases
 */
export class ConfigService {
  private getConfigWithCacheUseCase: GetConfigWithCacheUseCase;
  private updateConfigUseCase: UpdateConfigUseCase;

  /**
   * Creates a new ConfigService instance
   * @param apiBaseUrl - Base URL for the configuration API
   */
  constructor(apiBaseUrl: string) {
    /* Initialize datasource */
    const configDatasource = new HttpConfigDatasourceImp(apiBaseUrl);

    /* Initialize repository */
    const configRepository = new ConfigRepositoryImp(configDatasource);

    /* Initialize storage repository */
    const storageRepository = new LocalStorageConfigStorageRepositoryImp();

    /* Initialize cache use case */
    const getConfigUseCase = new GetConfigUseCase(configRepository);

    /* Initialize use cases */
    this.getConfigWithCacheUseCase = new GetConfigWithCacheUseCase(
      (request: GetConfigRequest) => getConfigUseCase.execute(request),
      storageRepository
    );
    this.updateConfigUseCase = new UpdateConfigUseCase(configRepository);
  }

  /**
   * Get configuration for a user with cache support
   * @param request - Request object with user identifier and token
   * @returns Promise that resolves to configuration with schema
   */
  async getConfig(request: GetConfigRequest) {
    return this.getConfigWithCacheUseCase.execute(request);
  }

  /**
   * Update configuration for a user
   * @param request - Request object with user identifier, token, and config data
   * @returns Promise that resolves to updated configuration with schema
   */
  async updateConfig(request: UpdateConfigRequest) {
    const result = await this.updateConfigUseCase.execute(request);

    /* Clear cache after update */
    this.clearCache();

    return result;
  }

  /**
   * Clear configuration cache
   */
  clearCache(): void {
    this.getConfigWithCacheUseCase.clearCache();
  }
}
