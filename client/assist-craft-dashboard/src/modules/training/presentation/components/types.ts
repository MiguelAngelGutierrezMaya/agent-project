import type { UploadSectionTabEnum } from './constants';

export interface UploadState {
  uploading: boolean;
  extracting: boolean;
}

export interface ComingSoonFeature {
  label: string;
}

/**
 * Upload Section Tab type
 */
export type UploadSectionTab =
  (typeof UploadSectionTabEnum)[keyof typeof UploadSectionTabEnum];
