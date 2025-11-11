import type { GetConfigRequest } from '@/modules/Config/domain/datasource/ConfigDatasource';
import type { ConfigWithSchema } from '@/modules/Config/domain/models/Config';
import type { ConfigStorageRepository } from '@/modules/Config/domain/repositories/ConfigStorageRepository';

/**
 * Use case for retrieving configuration with cache support
 * Orchestrates the configuration retrieval business logic with caching
 */
export class GetConfigWithCacheUseCase {
  /**
   * Creates a new GetConfigWithCacheUseCase instance
   * @param configRepository - The repository for configuration operations
   * @param storageRepository - The repository for cache operations
   */
  constructor(
    private readonly getConfig: (
      request: GetConfigRequest
    ) => Promise<ConfigWithSchema>,
    private readonly storageRepository: ConfigStorageRepository
  ) {}

  /**
   * Executes the configuration retrieval use case with cache
   * @param request - Request object with user identifier and token
   * @returns Promise that resolves to configuration with schema information
   */
  async execute(request: GetConfigRequest): Promise<ConfigWithSchema> {
    /* Try to get from cache first */
    if (this.storageRepository.isCacheValid()) {
      const cached = this.storageRepository.getCachedConfig();
      if (cached) {
        return cached;
      }
    }

    /* Fetch from API if cache is invalid or missing */
    const config = await this.getConfig(request);

    /* Save to cache */
    this.storageRepository.saveToCache(config);

    return config;
  }

  /**
   * Clear cache manually
   */
  clearCache(): void {
    this.storageRepository.clearCache();
  }
}
