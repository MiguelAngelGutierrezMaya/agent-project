/**
 * File type enum
 */
export enum FileTypeEnum {
  /** PNG image format */
  PNG = 'image/png',
  /** JPEG image format */
  JPEG = 'image/jpeg',
  /** JPG image format */
  JPG = 'image/jpg',
  /** PDF document format */
  PDF = 'application/pdf',
}

/**
 * File type type
 */
export type FileType = (typeof FileTypeEnum)[keyof typeof FileTypeEnum];

/**
 * File upload response interface
 */
export interface FileUploadResponse {
  /** S3 key of the uploaded file */
  key: string;
}

/**
 * File retrieval response interface
 */
export interface FileGetResponse {
  /** Presigned URL for file access */
  presignedUrl: string;
}
