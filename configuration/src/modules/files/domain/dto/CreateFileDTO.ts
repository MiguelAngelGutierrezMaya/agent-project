import { DomainValidationError } from '@src/infrastructure/shared/utils/errors/domain';
import {
  FileUpload,
  SupportedFileType,
} from '@modules/files/domain/models/File';

/**
 * Data Transfer Object for file upload validation
 * Validates base64 encoded file content, filename, type, and path prefix
 */
export class CreateFileDTO {
  /**
   * Creates a new CreateFileDTO instance
   * @param file - Base64 encoded file content
   * @param fileName - Original filename
   * @param fileType - MIME type of the file
   * @param pathPrefix - Path prefix for file organization in S3
   */
  constructor(
    public readonly file: string,
    public readonly fileName: string,
    public readonly fileType: string,
    public readonly pathPrefix: string
  ) {}

  /**
   * Creates and validates a CreateFileDTO from raw data
   * @param data - Raw data containing file information
   * @param data.file - Base64 encoded file content
   * @param data.fileName - Original filename
   * @param data.fileType - MIME type of the file
   * @param data.pathPrefix - Path prefix for file organization in S3
   * @returns Tuple containing the validated DTO or validation error
   */
  static create(data: {
    file: string;
    fileName: string;
    fileType: string;
    pathPrefix: string;
  }): [CreateFileDTO?, DomainValidationError?] {
    const { file, fileName, fileType, pathPrefix } = data;

    if (!file || file.trim().length === 0) {
      return [undefined, new DomainValidationError('File content is required')];
    }

    if (!fileName || fileName.trim().length === 0) {
      return [undefined, new DomainValidationError('File name is required')];
    }

    if (!fileType || fileType.trim().length === 0) {
      return [undefined, new DomainValidationError('File type is required')];
    }

    if (!pathPrefix || pathPrefix.trim().length === 0) {
      return [undefined, new DomainValidationError('Path prefix is required')];
    }

    // Validate file type against supported types
    const supportedTypes = Object.values(SupportedFileType);
    if (!supportedTypes.includes(fileType as SupportedFileType)) {
      return [
        undefined,
        new DomainValidationError(
          `Unsupported file type. Supported types: ${supportedTypes.join(', ')}`
        ),
      ];
    }

    // Validate base64 format
    try {
      const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
      if (!base64Regex.test(file)) {
        return [undefined, new DomainValidationError('Invalid base64 format')];
      }
    } catch (error) {
      return [undefined, new DomainValidationError('Invalid base64 format')];
    }

    // Validate size limit (10MB) - approximate calculation for base64
    const maxSize = 10 * 1024 * 1024; // 10MB
    const estimatedSize = (file.length * 3) / 4; // Base64 to bytes conversion
    if (estimatedSize > maxSize) {
      return [
        undefined,
        new DomainValidationError(
          `File size exceeds maximum allowed size of ${maxSize / (1024 * 1024)}MB`
        ),
      ];
    }

    return [new CreateFileDTO(file, fileName, fileType, pathPrefix), undefined];
  }

  public toDomain(): FileUpload {
    return {
      file: this.file,
      fileName: this.fileName,
      fileType: this.fileType,
      pathPrefix: this.pathPrefix,
    };
  }
}
