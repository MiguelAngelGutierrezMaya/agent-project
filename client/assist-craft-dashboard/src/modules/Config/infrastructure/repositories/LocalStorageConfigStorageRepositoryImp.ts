import type { ConfigWithSchema } from '@/modules/Config/domain/models/Config';
import type { ConfigStorageRepository } from '@/modules/Config/domain/repositories/ConfigStorageRepository';

/**
 * Storage key for configuration cache
 */
const CONFIG_CACHE_KEY = 'config_cache';
const CONFIG_CACHE_TIMESTAMP_KEY = 'config_cache_timestamp';
const CACHE_DURATION_MS = 1 * 60 * 1000; // 1 minute

/**
 * LocalStorage Configuration Storage Repository Implementation
 * Implements the repository pattern for configuration cache operations
 */
export class LocalStorageConfigStorageRepositoryImp
  implements ConfigStorageRepository
{
  /**
   * Retrieve cached configuration if still valid
   * @returns Cached configuration or null if expired/missing
   */
  getCachedConfig(): ConfigWithSchema | null {
    if (!this.isCacheValid()) {
      this.clearCache();
      return null;
    }

    const cached = localStorage.getItem(CONFIG_CACHE_KEY);
    if (!cached) {
      return null;
    }

    try {
      const config = JSON.parse(cached) as ConfigWithSchema;
      /* Convert date strings back to Date objects */
      return this.parseDates(config);
    } catch (error) {
      console.error(
        '[LocalStorageConfigStorage] Error parsing cached config:',
        error
      );
      this.clearCache();
      return null;
    }
  }

  /**
   * Save configuration to cache with timestamp
   * @param config - Configuration to cache
   */
  saveToCache(config: ConfigWithSchema): void {
    try {
      localStorage.setItem(CONFIG_CACHE_KEY, JSON.stringify(config));
      localStorage.setItem(CONFIG_CACHE_TIMESTAMP_KEY, Date.now().toString());
    } catch (error) {
      console.error(
        '[LocalStorageConfigStorage] Error saving config to cache:',
        error
      );
    }
  }

  /**
   * Check if cached configuration is still valid (not older than 5 minutes)
   * @returns true if cache is valid, false otherwise
   */
  isCacheValid(): boolean {
    const timestamp = localStorage.getItem(CONFIG_CACHE_TIMESTAMP_KEY);
    if (!timestamp) {
      return false;
    }

    const timestampMs = Number.parseInt(timestamp, 10);
    if (Number.isNaN(timestampMs)) {
      return false;
    }

    const now = Date.now();
    const age = now - timestampMs;
    return age < CACHE_DURATION_MS;
  }

  /**
   * Clear cached configuration
   */
  clearCache(): void {
    localStorage.removeItem(CONFIG_CACHE_KEY);
    localStorage.removeItem(CONFIG_CACHE_TIMESTAMP_KEY);
  }

  /**
   * Parse date strings in configuration to Date objects
   * @param config - Configuration with date strings
   * @returns Configuration with Date objects
   */
  private parseDates(config: ConfigWithSchema): ConfigWithSchema {
    return {
      ...config,
      createdAt: new Date(config.createdAt),
      updatedAt: new Date(config.updatedAt),
      optionsConfig: {
        ...config.optionsConfig,
        createdAt: new Date(config.optionsConfig.createdAt),
        updatedAt: new Date(config.optionsConfig.updatedAt),
      },
      socialConfig: {
        ...config.socialConfig,
        createdAt: new Date(config.socialConfig.createdAt),
        updatedAt: new Date(config.socialConfig.updatedAt),
      },
      aiConfig: {
        ...config.aiConfig,
        createdAt: new Date(config.aiConfig.createdAt),
        updatedAt: new Date(config.aiConfig.updatedAt),
        deletedAt: config.aiConfig.deletedAt
          ? new Date(config.aiConfig.deletedAt)
          : null,
      },
      billing: {
        ...config.billing,
        createdAt: new Date(config.billing.createdAt),
        updatedAt: new Date(config.billing.updatedAt),
      },
    };
  }
}
