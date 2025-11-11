/**
 * Document Metadata Type
 *
 * @description
 * Defines the structure for document metadata
 */
export type DocumentMetadata = {
  [key: string]: string | number | boolean | undefined;
};

/**
 * Database Document Data Type
 *
 * @description
 * Type for document data coming from database
 */
export interface DatabaseDocumentData {
  id: string;
  name: string;
  type: string;
  url: string;
  is_embedded: boolean;
  created_at: string | Date;
  updated_at: string | Date;
  deleted_at?: string | Date;
}

/**
 * Database Document Embedding Data Type
 *
 * @description
 * Type for document embedding data coming from database
 */
export interface DatabaseDocumentEmbeddingData {
  id: string;
  document_id: string;
  content_markdown: string;
  embedding_status: string;
  embedding_model?: string;
  batch_id?: string;
  embedding?: number[];
  created_at: string | Date;
  updated_at: string | Date;
  // Document data from JOIN
  document_name?: string;
  document_type?: string;
  document_url?: string;
  document_is_embedded?: boolean;
  document_created_at?: string | Date;
  document_updated_at?: string | Date;
}

/**
 * Document Model
 *
 * @description
 * Represents a document with all its related information
 */
export interface Document {
  /** Document ID */
  id: string;
  /** Document name */
  name: string;
  /** Document type */
  type: string;
  /** Document URL */
  url: string;
  /** Whether document is embedded */
  isEmbedded: boolean;
  /** Document creation date */
  createdAt: Date;
  /** Document update date */
  updatedAt: Date;
}

/**
 * Document Embedding Model
 *
 * @description
 * Represents a document with its embedding data and related information
 */
export interface DocumentEmbedding {
  /** The embedding table ID */
  id: string;
  /** The document object with all its data */
  document: Document;
  /** Generated markdown content */
  markdown: string;
  /** Embedding model used */
  embeddingModel?: string;
  /** Batch ID for batch processing */
  batchId?: string;
  /** Embedding status */
  embeddingStatus?: string;
}
