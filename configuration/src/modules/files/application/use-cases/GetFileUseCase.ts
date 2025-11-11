import { FileRepository } from '@modules/files/domain/repositories/FileRepository';

/**
 * Use case for retrieving files
 * Orchestrates the file retrieval business logic
 */
export class GetFileUseCase {
  /**
   * Creates a new GetFileUseCase instance
   * @param fileRepository - The repository for file operations
   */
  constructor(private readonly fileRepository: FileRepository) {}

  /**
   * Executes the file retrieval use case
   * @param key - Storage key of the file to retrieve
   * @returns Promise that resolves to a presigned URL for the file
   */
  async execute(key: string): Promise<string> {
    return this.fileRepository.getPresignedUrl(key);
  }
}
