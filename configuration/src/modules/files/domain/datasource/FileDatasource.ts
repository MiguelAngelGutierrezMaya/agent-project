/**
 * Interface for file data source operations
 * Defines contracts for file storage and retrieval operations
 */
export interface FileDatasource {
  /**
   * Upload a file to S3 storage
   * @param file - Base64 encoded file content
   * @param fileName - Original filename
   * @param fileType - MIME type of the file
   * @param pathPrefix - Path prefix for file organization in S3
   * @returns Promise that resolves to the S3 key of the uploaded file
   */
  uploadFile(
    file: string,
    fileName: string,
    fileType: string,
    pathPrefix: string
  ): Promise<string>;

  /**
   * Generate a presigned URL for file access from S3
   * @param key - S3 key of the file to access
   * @returns Promise that resolves to a presigned URL for the file
   */
  getPresignedUrl(key: string): Promise<string>;
}
