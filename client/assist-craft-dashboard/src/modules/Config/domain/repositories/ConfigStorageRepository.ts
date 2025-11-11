import type { ConfigWithSchema } from '@/modules/Config/domain/models/Config';

/**
 * Configuration Storage Repository Interface
 * Defines the contract for configuration cache storage operations
 */
export interface ConfigStorageRepository {
  /**
   * Retrieve cached configuration if still valid
   * @returns Cached configuration or null if expired/missing
   */
  getCachedConfig(): ConfigWithSchema | null;

  /**
   * Save configuration to cache with timestamp
   * @param config - Configuration to cache
   */
  saveToCache(config: ConfigWithSchema): void;

  /**
   * Check if cached configuration is still valid (not older than 5 minutes)
   * @returns true if cache is valid, false otherwise
   */
  isCacheValid(): boolean;

  /**
   * Clear cached configuration
   */
  clearCache(): void;
}
