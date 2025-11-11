import type { FileGetResponse } from '@/modules/shared/files/domain/models/File';
import type { FileStorageRepository } from '@/modules/shared/files/domain/repositories/FileStorageRepository';

/**
 * Cache duration in milliseconds (10 minutes)
 */
const CACHE_DURATION_MS = 10 * 60 * 1000; // 10 minutes

/**
 * Get cache key for a file key
 * @param key - File key
 * @returns Cache key
 */
const getCacheKey = (key: string): string => `file_cache_${key}`;

/**
 * Get cache timestamp key for a file key
 * @param key - File key
 * @returns Cache timestamp key
 */
const getCacheTimestampKey = (key: string): string =>
  `file_cache_timestamp_${key}`;

/**
 * LocalStorage File Storage Repository Implementation
 * Implements the repository pattern for file cache operations
 */
export class LocalStorageFileStorageRepositoryImp
  implements FileStorageRepository
{
  /**
   * Retrieve cached presigned URL if still valid
   * @param key - File key to retrieve from cache
   * @returns Cached presigned URL response or null if expired/missing
   */
  getCachedPresignedUrl(key: string): FileGetResponse | null {
    if (!this.isCacheValid(key)) {
      this.clearCache(key);
      return null;
    }

    const cached = localStorage.getItem(getCacheKey(key));
    if (!cached) {
      return null;
    }

    try {
      const response = JSON.parse(cached) as FileGetResponse;
      return response;
    } catch (error) {
      console.error(
        '[LocalStorageFileStorage] Error parsing cached presigned URL:',
        error
      );
      this.clearCache(key);
      return null;
    }
  }

  /**
   * Save presigned URL to cache with timestamp
   * @param key - File key to cache
   * @param response - Presigned URL response to cache
   */
  saveToCache(key: string, response: FileGetResponse): void {
    try {
      localStorage.setItem(getCacheKey(key), JSON.stringify(response));
      localStorage.setItem(getCacheTimestampKey(key), Date.now().toString());
    } catch (error) {
      console.error(
        '[LocalStorageFileStorage] Error saving presigned URL to cache:',
        error
      );
    }
  }

  /**
   * Check if cached presigned URL is still valid (not older than 10 minutes)
   * @param key - File key to check
   * @returns true if cache is valid, false otherwise
   */
  isCacheValid(key: string): boolean {
    const timestamp = localStorage.getItem(getCacheTimestampKey(key));
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
   * Clear cached presigned URL for a specific key
   * @param key - File key to clear from cache
   */
  clearCache(key: string): void {
    localStorage.removeItem(getCacheKey(key));
    localStorage.removeItem(getCacheTimestampKey(key));
  }
}
