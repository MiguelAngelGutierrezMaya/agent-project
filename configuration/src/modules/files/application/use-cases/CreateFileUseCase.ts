import { FileRepository } from '@modules/files/domain/repositories/FileRepository';

/**
 * Use case for creating/uploading files
 * Orchestrates the file upload business logic
 */
export class CreateFileUseCase {
  /**
   * Creates a new CreateFileUseCase instance
   * @param fileRepository - The repository for file operations
   */
  constructor(private readonly fileRepository: FileRepository) {}

  /**
   * Executes the file upload use case
   * @param file - Base64 encoded file content
   * @param fileName - Original filename
   * @param fileType - MIME type of the file
   * @param pathPrefix - Path prefix for file organization in S3
   * @returns Promise that resolves to the storage key of the uploaded file
   */
  async execute(
    file: string,
    fileName: string,
    fileType: string,
    pathPrefix: string
  ): Promise<string> {
    return this.fileRepository.uploadFile(file, fileName, fileType, pathPrefix);
  }
}
