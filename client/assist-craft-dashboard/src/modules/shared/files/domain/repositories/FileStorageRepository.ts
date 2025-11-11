import type { FileGetResponse } from '@/modules/shared/files/domain/models/File';

/**
 * File Storage Repository Interface
 * Defines the contract for file cache storage operations
 */
export interface FileStorageRepository {
  /**
   * Retrieve cached presigned URL if still valid
   * @param key - File key to retrieve from cache
   * @returns Cached presigned URL response or null if expired/missing
   */
  getCachedPresignedUrl(key: string): FileGetResponse | null;

  /**
   * Save presigned URL to cache with timestamp
   * @param key - File key to cache
   * @param response - Presigned URL response to cache
   */
  saveToCache(key: string, response: FileGetResponse): void;

  /**
   * Check if cached presigned URL is still valid (not older than 10 minutes)
   * @param key - File key to check
   * @returns true if cache is valid, false otherwise
   */
  isCacheValid(key: string): boolean;

  /**
   * Clear cached presigned URL for a specific key
   * @param key - File key to clear from cache
   */
  clearCache(key: string): void;
}
