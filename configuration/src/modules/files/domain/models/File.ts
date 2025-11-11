/**
 * File upload data interface containing base64 encoded file content and metadata
 */
export interface FileUpload {
  /** Base64 encoded file content */
  file: string;
  /** Original filename */
  fileName: string;
  /** MIME type of the file */
  fileType: string;
  /** Path prefix for file organization in S3 */
  pathPrefix: string;
}

/**
 * Enumeration of supported file types for upload validation
 */
export enum SupportedFileType {
  /** PNG image format */
  PNG = 'image/png',
  /** JPEG image format */
  JPEG = 'image/jpeg',
  /** JPG image format */
  JPG = 'image/jpg',
  /** PDF document format */
  PDF = 'application/pdf',
}
