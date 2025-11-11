/**
 * MongoDB collection names used in the configuration module.
 *
 * @description
 * This file centralizes all collection name constants to:
 * - Avoid typos and inconsistencies
 * - Facilitate refactoring and maintenance
 * - Provide a single source of truth for collection names
 *
 * @constant
 */

/**
 * Collection name in the public database that stores all client configurations.
 * This collection serves as a global registry of all clients and their settings.
 */
export const CLIENT_CONFIGS_COLLECTION = 'client_configs';

/**
 * Collection name in tenant-specific databases that stores individual client configuration.
 * Each tenant database has one document in this collection with their specific configuration.
 */
export const TENANT_CONFIG_COLLECTION = 'config';

/**
 * All collection names used in the config module.
 * Useful for validation and documentation purposes.
 */
export const CONFIG_COLLECTIONS = {
  PUBLIC: CLIENT_CONFIGS_COLLECTION,
  TENANT: TENANT_CONFIG_COLLECTION,
} as const;
