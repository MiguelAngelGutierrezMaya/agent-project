import { FileDatasource } from '@modules/files/domain/datasource/FileDatasource';
import { LoggerService } from '@src/domain/services/Logger';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import { DomainValidationError } from '@src/infrastructure/shared/utils/errors/domain';
import { SupportedFileType } from '@modules/files/domain/models/File';

/**
 * S3 implementation of the FileDatasource interface
 * Handles file storage and retrieval operations using AWS S3
 */
export class S3FileDatasourceImp implements FileDatasource {
  private s3Client: S3Client;
  private logger: LoggerService;

  /**
   * Creates a new S3FileDatasourceImp instance
   * @param logger - Logger service for logging operations
   */
  constructor(logger: LoggerService) {
    this.logger = logger;
    this.s3Client = new S3Client({
      region: process.env.REGION || 'us-east-1',
    });
  }

  /**
   * Upload a file to S3 storage
   * @param file - Base64 encoded file content
   * @param fileName - Original filename
   * @param fileType - MIME type of the file
   * @param pathPrefix - Path prefix for file organization in S3
   * @returns Promise that resolves to the S3 key of the uploaded file
   */
  async uploadFile(
    file: string,
    fileName: string,
    fileType: string,
    pathPrefix: string
  ): Promise<string> {
    try {
      this.logger.info(`Uploading file: ${fileName}`, S3FileDatasourceImp.name);

      // Generate extension from file type
      const fileExtension = this.getFileExtension(fileName, fileType);

      if (!fileExtension) {
        throw new DomainValidationError('File extension is not valid');
      }

      const baseFileName = fileName.replace(fileExtension, '');
      const s3Key = `${pathPrefix}/${baseFileName}-${uuidv4()}${fileExtension}`;

      // Get bucket name from environment
      const bucket = process.env.BUCKET_NAME;
      if (!bucket) {
        throw new DomainValidationError(
          'BUCKET_NAME environment variable is not set'
        );
      }

      // Convert base64 to Buffer
      const buffer = Buffer.from(file, 'base64');

      // Upload file to S3
      const command = new PutObjectCommand({
        Bucket: bucket,
        Key: s3Key,
        Body: buffer,
        ContentType: fileType,
      });

      await this.s3Client.send(command);

      this.logger.info(
        `File uploaded successfully: ${s3Key}`,
        S3FileDatasourceImp.name
      );

      return s3Key;
    } catch (error) {
      this.logger.error(
        `Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`,
        S3FileDatasourceImp.name
      );
      throw error;
    }
  }

  /**
   * Generate a presigned URL for file access from S3
   * @param key - S3 key of the file to access
   * @returns Promise that resolves to a presigned URL for the file
   */
  async getPresignedUrl(key: string): Promise<string> {
    try {
      this.logger.info(
        `Generating presigned URL for: ${key}`,
        S3FileDatasourceImp.name
      );

      // Get bucket name from environment
      const bucket = process.env.BUCKET_NAME;
      if (!bucket) {
        throw new DomainValidationError(
          'BUCKET_NAME environment variable is not set'
        );
      }

      // Create command for getting the object
      const command = new GetObjectCommand({
        Bucket: bucket,
        Key: key,
      });

      const expiresIn = 60 * 60 * 5; // 5 hours

      // Generate presigned URL
      const presignedUrl = await getSignedUrl(this.s3Client, command, {
        expiresIn: expiresIn,
      });

      this.logger.info(
        `Presigned URL generated successfully for: ${key}`,
        S3FileDatasourceImp.name
      );

      return presignedUrl;
    } catch (error) {
      this.logger.error(
        `Failed to generate presigned URL: ${error instanceof Error ? error.message : 'Unknown error'}`,
        S3FileDatasourceImp.name
      );
      throw error;
    }
  }

  /**
   * Extracts file extension from filename
   * @param filename - Original filename
   * @returns File extension with dot, empty string if no extension found
   */
  private getFileExtension(filename: string, fileType: string): string {
    const types: Record<string, string> = Object.fromEntries(
      Object.values(SupportedFileType).map(type => [
        type,
        `.${type.split('/')[1].toLowerCase()}`,
      ])
    );

    if (types[fileType]) {
      return types[fileType];
    }

    const lastDotIndex = filename.lastIndexOf('.');
    if (lastDotIndex === -1) {
      return '';
    }
    return filename.substring(lastDotIndex);
  }
}
