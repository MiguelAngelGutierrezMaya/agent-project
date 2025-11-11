import type { GetFileRequest } from '@/modules/shared/files/domain/datasource/FileDatasource';
import type { FileGetResponse } from '@/modules/shared/files/domain/models/File';
import type { FileStorageRepository } from '@/modules/shared/files/domain/repositories/FileStorageRepository';

/**
 * Use case for retrieving presigned URL with cache support
 * Orchestrates the file retrieval business logic with caching
 */
export class GetFileWithCacheUseCase {
  /**
   * Creates a new GetFileWithCacheUseCase instance
   * @param getPresignedUrl - Function to get presigned URL from API
   * @param storageRepository - The repository for cache operations
   */
  constructor(
    private readonly getPresignedUrl: (
      request: GetFileRequest
    ) => Promise<FileGetResponse>,
    private readonly storageRepository: FileStorageRepository
  ) {}

  /**
   * Executes the file retrieval use case with cache
   * @param request - Request object with user identifier, token, and file key
   * @returns Promise that resolves to presigned URL response
   */
  async execute(request: GetFileRequest): Promise<FileGetResponse> {
    /* Try to get from cache first */
    if (this.storageRepository.isCacheValid(request.key)) {
      const cached = this.storageRepository.getCachedPresignedUrl(request.key);
      if (cached) {
        return cached;
      }
    }

    /* Fetch from API if cache is invalid or missing */
    const response = await this.getPresignedUrl(request);

    /* Save to cache */
    this.storageRepository.saveToCache(request.key, response);

    return response;
  }

  /**
   * Clear cache for a specific file key
   * @param key - File key to clear from cache
   */
  clearCache(key: string): void {
    this.storageRepository.clearCache(key);
  }
}
