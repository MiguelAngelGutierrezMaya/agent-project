/**
 * Embedding Result Interface
 *
 * @description
 * Represents the result of an embedding generation operation
 */
export interface EmbeddingResult {
  /** The generated embedding vector */
  embedding: number[] | null;
  /** The original text that was embedded */
  originalText: string;
  /** The entity ID this embedding belongs to */
  entityId: string;
  /** The entity type (table name: product_embeddings or document_embeddings) */
  entityType: string;
  /** The schema name where the entity exists */
  schemaName: string;
  /** Optional batch ID for batch processing */
  batchId?: string;
}
