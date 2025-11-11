/**
 * Document type enum
 */
export enum DocumentEnum {
  PDF = 'pdf',
  URL = 'url',
}

/**
 * Document type type
 */
export type DocumentType = (typeof DocumentEnum)[keyof typeof DocumentEnum];

/**
 * Base document data interface containing document properties
 */
export interface DocumentData {
  /** Name of the document */
  name: string;
  /** Type of document (PDF file or URL reference) */
  type: DocumentType;
  /** URL or path to the document */
  url: string;
  /** Whether the document is embedded in the system */
  isEmbedded: boolean;
  /** Document creation timestamp */
  createdAt: Date;
  /** Document last update timestamp */
  updatedAt: Date;
}

/**
 * Complete document interface including unique identifier
 */
export interface Document extends DocumentData {
  /** Unique document identifier */
  id: string;
}

/**
 * Paginated response interface for document collections
 * Reflects the actual API response structure with data attribute
 */
export interface DocumentsResponse {
  /** Array of documents */
  data: Document[];
  /** Total number of documents */
  total: number;
  /** Current page limit */
  limit: number;
  /** Current page offset */
  offset: number;
}
