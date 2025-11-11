import type {
  CreateFileRequest,
  GetFileRequest,
} from '@/modules/shared/files/domain/datasource/FileDatasource';
import type {
  FileUploadResponse,
  FileGetResponse,
} from '@/modules/shared/files/domain/models/File';

/**
 * File Repository Interface
 * Defines the contract for file data operations
 */
export interface FileRepository {
  /**
   * Upload a file to storage
   * @param request - Request object with user identifier, token, and file data
   * @returns Promise that resolves to file upload response with S3 key
   */
  uploadFile(request: CreateFileRequest): Promise<FileUploadResponse>;

  /**
   * Get a presigned URL for file access
   * @param request - Request object with user identifier, token, and file key
   * @returns Promise that resolves to file get response with presigned URL
   */
  getPresignedUrl(request: GetFileRequest): Promise<FileGetResponse>;
}
