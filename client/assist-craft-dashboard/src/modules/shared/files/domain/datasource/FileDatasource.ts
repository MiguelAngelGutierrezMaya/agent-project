import type { UserApiRequest } from '@/modules/shared/domain/interfaces/ApiRequest';
import type {
  FileUploadResponse,
  FileGetResponse,
  FileType,
} from '@/modules/shared/files/domain/models/File';

/**
 * Create File Request
 */
export interface CreateFileRequest extends UserApiRequest {
  /** Base64 encoded file content */
  file: string;
  /** Original filename */
  fileName: string;
  /** MIME type of the file */
  fileType: FileType;
  /** Path prefix for file organization in S3 */
  pathPrefix: string;
}

/**
 * Get File Request
 */
export interface GetFileRequest extends UserApiRequest {
  /** S3 key of the file to retrieve */
  key: string;
}

/**
 * File Datasource Interface
 * Defines the contract for data source operations
 */
export interface FileDatasource {
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
