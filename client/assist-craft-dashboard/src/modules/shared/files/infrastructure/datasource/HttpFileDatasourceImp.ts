import type {
  FileDatasource,
  CreateFileRequest,
  GetFileRequest,
} from '@/modules/shared/files/domain/datasource/FileDatasource';
import type {
  FileUploadResponse,
  FileGetResponse,
} from '@/modules/shared/files/domain/models/File';

/**
 * API Response interface
 */
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

/**
 * HTTP File Datasource Implementation
 * Communicates with the files service via REST API
 */
export class HttpFileDatasourceImp implements FileDatasource {
  private readonly apiBaseUrl: string;

  /**
   * Creates a new HTTP File Datasource instance
   * @param apiBaseUrl - Base URL for the configuration API
   */
  constructor(apiBaseUrl: string) {
    this.apiBaseUrl = apiBaseUrl;
  }

  /**
   * Get authorization headers with token
   * @param token - Authentication token
   * @returns Headers object with authorization
   */
  private getAuthHeaders(token: string): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
  }

  /**
   * Build query string from parameters
   * @param params - Object with query parameters
   * @returns Query string
   */
  private buildQueryString(params: Record<string, string | undefined>): string {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value);
      }
    });
    return queryParams.toString();
  }

  /**
   * Upload a file via the API
   * @param request - Request object with user identifier, token, and file data
   * @returns Promise that resolves to file upload response with S3 key
   */
  async uploadFile(request: CreateFileRequest): Promise<FileUploadResponse> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/files`, {
        method: 'POST',
        headers: this.getAuthHeaders(request.token),
        body: JSON.stringify({
          userId: request.userId,
          file: request.file,
          fileName: request.fileName,
          fileType: request.fileType,
          pathPrefix: request.pathPrefix,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to upload file: ${response.status} ${errorText}`
        );
      }

      const data = (await response.json()) as ApiResponse<{ key: string }>;

      if (!data.success || !data.data) {
        throw new Error('Invalid response format from API');
      }

      return {
        key: data.data.key,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      console.error(
        '[HttpFileDatasourceImp] Error uploading file:',
        errorMessage
      );
      throw error;
    }
  }

  /**
   * Get a presigned URL via the API
   * @param request - Request object with user identifier, token, and file key
   * @returns Promise that resolves to file get response with presigned URL
   */
  async getPresignedUrl(request: GetFileRequest): Promise<FileGetResponse> {
    try {
      const queryParams = this.buildQueryString({
        userId: request.userId,
        key: request.key,
      });

      const response = await fetch(`${this.apiBaseUrl}/files?${queryParams}`, {
        method: 'GET',
        headers: this.getAuthHeaders(request.token),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to get file URL: ${response.status} ${errorText}`
        );
      }

      const data = (await response.json()) as ApiResponse<{
        presignedUrl: string;
      }>;

      if (!data.success || !data.data) {
        throw new Error('Invalid response format from API');
      }

      return {
        presignedUrl: data.data.presignedUrl,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      console.error(
        '[HttpFileDatasourceImp] Error getting file URL:',
        errorMessage
      );
      throw error;
    }
  }
}
