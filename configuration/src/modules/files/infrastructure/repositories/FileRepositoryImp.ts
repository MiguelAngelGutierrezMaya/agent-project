import { FileRepository } from '@modules/files/domain/repositories/FileRepository';
import { FileDatasource } from '@modules/files/domain/datasource/FileDatasource';

/**
 * Implementation of the FileRepository interface
 * Delegates file operations to the datasource layer
 */
export class FileRepositoryImp implements FileRepository {
  /**
   * Creates a new FileRepositoryImp instance
   * @param fileDatasource - The datasource implementation for file operations
   */
  constructor(private readonly fileDatasource: FileDatasource) {}

  /**
   * Upload a file to storage
   * @param file - Base64 encoded file content
   * @param fileName - Original filename
   * @param fileType - MIME type of the file
   * @param pathPrefix - Path prefix for file organization in S3
   * @returns Promise that resolves to the storage key of the uploaded file
   */
  async uploadFile(
    file: string,
    fileName: string,
    fileType: string,
    pathPrefix: string
  ): Promise<string> {
    return this.fileDatasource.uploadFile(file, fileName, fileType, pathPrefix);
  }

  /**
   * Get a presigned URL for file access
   * @param key - Storage key of the file
   * @returns Promise that resolves to a presigned URL for the file
   */
  async getPresignedUrl(key: string): Promise<string> {
    return this.fileDatasource.getPresignedUrl(key);
  }
}
