import { CreateFileUseCase } from '@/modules/shared/files/application/useCases/CreateFileUseCase';
import { GetFileUseCase } from '@/modules/shared/files/application/useCases/GetFileUseCase';
import { GetFileWithCacheUseCase } from '@/modules/shared/files/application/useCases/GetFileWithCacheUseCase';
import type {
  CreateFileRequest,
  GetFileRequest,
} from '@/modules/shared/files/domain/datasource/FileDatasource';
import { HttpFileDatasourceImp } from '@/modules/shared/files/infrastructure/datasource/HttpFileDatasourceImp';
import { FileRepositoryImp } from '@/modules/shared/files/infrastructure/repositories/FileRepositoryImp';
import { LocalStorageFileStorageRepositoryImp } from '@/modules/shared/files/infrastructure/repositories/LocalStorageFileStorageRepositoryImp';

/**
 * File Service
 * Orchestrates file operations using use cases
 */
export class FileService {
  private createFileUseCase: CreateFileUseCase;
  private getFileWithCacheUseCase: GetFileWithCacheUseCase;

  /**
   * Creates a new FileService instance
   * @param apiBaseUrl - Base URL for the configuration API
   */
  constructor(apiBaseUrl: string) {
    /* Initialize datasource */
    const fileDatasource = new HttpFileDatasourceImp(apiBaseUrl);

    /* Initialize repository */
    const fileRepository = new FileRepositoryImp(fileDatasource);

    /* Initialize storage repository */
    const storageRepository = new LocalStorageFileStorageRepositoryImp();

    /* Initialize cache use case */
    const getFileUseCase = new GetFileUseCase(fileRepository);

    /* Initialize use cases */
    this.createFileUseCase = new CreateFileUseCase(fileRepository);
    this.getFileWithCacheUseCase = new GetFileWithCacheUseCase(
      (request: GetFileRequest) => getFileUseCase.execute(request),
      storageRepository
    );
  }

  /**
   * Upload a file for a user
   * @param request - Request object with user identifier, token, and file data
   * @returns Promise that resolves to file upload response with S3 key
   */
  async uploadFile(request: CreateFileRequest) {
    return this.createFileUseCase.execute(request);
  }

  /**
   * Get a presigned URL for file access with cache support
   * @param request - Request object with user identifier, token, and file key
   * @returns Promise that resolves to file get response with presigned URL
   */
  async getPresignedUrl(request: GetFileRequest) {
    return this.getFileWithCacheUseCase.execute(request);
  }

  /**
   * Clear cache for a specific file key
   * @param key - File key to clear from cache
   */
  clearCache(key: string): void {
    this.getFileWithCacheUseCase.clearCache(key);
  }
}
