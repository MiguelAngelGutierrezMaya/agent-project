import { Document } from '@modules/embedding/domain/models/Document';

/**
 * Document Embedding Model
 *
 * @description
 * Represents a document with its embedding data and related information
 */
export interface DocumentEmbedding {
  /** The document object with all its data */
  document: Document;
  /** Generated markdown content */
  markdown: string;
  /** Schema name where the document exists */
  schemaName: string;
}
