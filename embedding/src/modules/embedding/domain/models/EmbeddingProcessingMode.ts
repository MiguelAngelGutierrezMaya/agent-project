/**
 * Embedding Processing Mode Enum
 *
 * @description
 * Defines the available processing modes for embedding generation
 */
export enum EmbeddingProcessingMode {
  /** Direct processing - one embedding at a time */
  DIRECT = 'direct',
  /** Batch processing - multiple embeddings in batches */
  BATCH = 'batch',
}
