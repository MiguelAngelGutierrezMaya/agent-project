import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

/**
 * Product Media Service
 *
 * @description
 * Generates presigned URLs for product media assets stored in S3.
 * Falls back gracefully when media configuration is missing or keys are invalid.
 */
@Injectable()
export class ProductMediaService {
  private readonly logger = new Logger(ProductMediaService.name);
  private readonly s3Client: S3Client;
  private readonly bucketName: string;
  private readonly presignedExpiresIn: number;

  constructor(private readonly configService: ConfigService) {
    const region = this.configService.getOrThrow<string>('aws.region');
    this.bucketName = this.configService.getOrThrow<string>('files.bucketName');
    this.presignedExpiresIn = this.configService.getOrThrow<number>(
      'files.presignedExpiresIn'
    );

    this.s3Client = new S3Client({ region });
  }

  /**
   * Resolve a product image path to an accessible URL.
   *
   * @param imagePath Product image path or absolute URL.
   * @returns Resolved image URL or null if unavailable.
   */
  async resolveImageUrl(imagePath?: string | null): Promise<string | null> {
    if (!imagePath) {
      return null;
    }

    if (this.isExternalUrl(imagePath)) {
      return imagePath;
    }

    if (!this.bucketName) {
      this.logger.warn(
        'BUCKET_NAME is not configured; cannot generate presigned URL.'
      );
      return null;
    }

    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: imagePath,
      });

      const presignedUrl = await getSignedUrl(this.s3Client, command, {
        expiresIn: this.presignedExpiresIn,
      });

      return presignedUrl;
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : typeof error === 'string'
            ? error
            : 'unknown error';
      this.logger.error(
        `Failed to generate presigned URL for key "${imagePath}": ${message}`
      );
      return null;
    }
  }

  private isExternalUrl(url: string): boolean {
    return /^https?:\/\//i.test(url);
  }
}
