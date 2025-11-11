import { DomainValidationError } from '@src/infrastructure/shared/utils/errors/domain';

/**
 * Data Transfer Object for file retrieval validation
 * Validates S3 key for file access
 */
export class GetFileDTO {
  /**
   * Creates a new GetFileDTO instance
   * @param key - S3 key of the file to retrieve
   */
  constructor(public readonly key: string) {}

  /**
   * Creates and validates a GetFileDTO from raw data
   * @param data - Raw data containing the S3 key
   * @param data.key - S3 key of the file to retrieve
   * @returns Tuple containing the validated DTO or validation error
   */
  static create(data: { key: string }): [GetFileDTO?, DomainValidationError?] {
    const { key } = data;

    if (!key || key.trim().length === 0) {
      return [undefined, new DomainValidationError('Key is required')];
    }

    return [new GetFileDTO(key.trim()), undefined];
  }
}
