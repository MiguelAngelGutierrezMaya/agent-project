import type {
  FileDatasource,
  CreateFileRequest,
  GetFileRequest,
} from '@/modules/shared/files/domain/datasource/FileDatasource';
import type { FileRepository } from '@/modules/shared/files/domain/repositories/FileRepository';

/**
 * File Repository Implementation
 * Delegates operations to the datasource layer
 */
export class FileRepositoryImp implements FileRepository {
  /**
   * Creates a new FileRepositoryImp instance
   * @param fileDatasource - The datasource implementation for file operations
   */
  constructor(private readonly fileDatasource: FileDatasource) {}

  /**
   * Upload a file to storage
   * @param request - Request object with user identifier, token, and file data
   * @returns Promise that resolves to file upload response with S3 key
   */
  async uploadFile(request: CreateFileRequest) {
    return this.fileDatasource.uploadFile(request);
  }

  /**
   * Get a presigned URL for file access
   * @param request - Request object with user identifier, token, and file key
   * @returns Promise that resolves to file get response with presigned URL
   */
  async getPresignedUrl(request: GetFileRequest) {
    return this.fileDatasource.getPresignedUrl(request);
  }
}
