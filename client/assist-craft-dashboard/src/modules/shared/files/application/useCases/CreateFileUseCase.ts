import type { CreateFileRequest } from '@/modules/shared/files/domain/datasource/FileDatasource';
import type { FileUploadResponse } from '@/modules/shared/files/domain/models/File';
import type { FileRepository } from '@/modules/shared/files/domain/repositories/FileRepository';

/**
 * Create File Use Case
 * Creates/uploads a file to storage
 */
export class CreateFileUseCase {
  /**
   * Creates a new CreateFileUseCase instance
   * @param fileRepository - Repository for file data operations
   */
  constructor(private readonly fileRepository: FileRepository) {}

  /**
   * Execute the create file use case
   * @param request - Request object with user identifier, token, and file data
   * @returns Promise that resolves to file upload response with S3 key
   */
  async execute(request: CreateFileRequest): Promise<FileUploadResponse> {
    return this.fileRepository.uploadFile(request);
  }
}
