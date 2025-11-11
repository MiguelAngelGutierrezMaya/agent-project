import { PaginatedResponse } from '@src/infrastructure/shared/models/PaginatedResponse';

/**
 * Base document data interface containing document properties
 */
export interface DocumentData {
  /** Name of the document */
  name: string;
  /** Type of document (PDF file or URL reference) */
  type: 'pdf' | 'url';
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
 */
export interface DocumentsResponse extends PaginatedResponse<Document> {}
