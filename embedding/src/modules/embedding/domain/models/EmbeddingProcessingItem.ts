import { ProductEmbedding } from '@modules/embedding/domain/models/Product';
import { DocumentEmbedding } from '@modules/embedding/domain/models/Document';

/**
 * Embedding Processing Item Interface
 *
 * @description
 * Unified interface for processing embeddings with all necessary context
 */
export interface EmbeddingProcessingItem {
  /** The markdown text to be embedded */
  markdown: string;
  /** The entity ID this embedding belongs to */
  entityId: string;
  /** The entity type (table name: product_embeddings or document_embeddings) */
  entityType: string;
  /** The schema name where the entity exists */
  schemaName: string;
  /** The embedding data (product or document) */
  embeddingData: ProductEmbedding | DocumentEmbedding;
}
