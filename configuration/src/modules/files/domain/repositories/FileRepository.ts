/**
 * Interface for file repository operations
 * Defines contracts for file business logic operations
 */
export interface FileRepository {
  /**
   * Upload a file to storage
   * @param file - Base64 encoded file content
   * @param fileName - Original filename
   * @param fileType - MIME type of the file
   * @param pathPrefix - Path prefix for file organization in S3
   * @returns Promise that resolves to the storage key of the uploaded file
   */
  uploadFile(
    file: string,
    fileName: string,
    fileType: string,
    pathPrefix: string
  ): Promise<string>;

  /**
   * Get a presigned URL for file access
   * @param key - Storage key of the file
   * @returns Promise that resolves to a presigned URL for the file
   */
  getPresignedUrl(key: string): Promise<string>;
}
