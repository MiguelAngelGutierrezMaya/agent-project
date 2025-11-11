import type { GetFileRequest } from '@/modules/shared/files/domain/datasource/FileDatasource';
import type { FileGetResponse } from '@/modules/shared/files/domain/models/File';
import type { FileRepository } from '@/modules/shared/files/domain/repositories/FileRepository';

/**
 * Get File Use Case
 * Retrieves a presigned URL for file access
 */
export class GetFileUseCase {
  /**
   * Creates a new GetFileUseCase instance
   * @param fileRepository - Repository for file data operations
   */
  constructor(private readonly fileRepository: FileRepository) {}

  /**
   * Execute the get file use case
   * @param request - Request object with user identifier, token, and file key
   * @returns Promise that resolves to file get response with presigned URL
   */
  async execute(request: GetFileRequest): Promise<FileGetResponse> {
    return this.fileRepository.getPresignedUrl(request);
  }
}
