import type { ComingSoonFeature } from './types';

export const comingSoonFeatures: ComingSoonFeature[] = [
  { label: 'CSV file support' },
  { label: 'DOCX document upload' },
  { label: 'Manual text input' },
  { label: 'Bulk file processing' },
];

/**
 * Upload Section Tab values enum
 */
export enum UploadSectionTabEnum {
  DOCUMENT = 'document',
  PRODUCT = 'product',
}

/**
 * File size limits in bytes
 */
export const MAX_PDF_SIZE = 5 * 1024 * 1024; // 5MB
export const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
