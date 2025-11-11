/**
 * Modification Status Enum
 *
 * @description
 * Enum representing the possible statuses for modification requests.
 */
export enum ModificationStatus {
  PENDING = 'pending',
  REVIEWED = 'reviewed',
}

export type ModificationStatusType =
  (typeof ModificationStatus)[keyof typeof ModificationStatus];

/**
 * Modification Request Model
 *
 * @description
 * Represents a modification request tracked for embedding generation.
 * This is the generic data stored in modification_requests table.
 */
export interface ModificationRequest {
  /**
   * Unique identifier for the modification request
   */
  id: string;

  /**
   * Company schema name where the modification occurred
   * @example 'crealodigital', 'client_schema'
   */
  schemaName: string;

  /**
   * Name of the table that was modified
   * @example 'product_embeddings', 'document_embeddings'
   */
  tableName: string;

  /**
   * Modification status indicating processing state
   * @example 'pending' - waiting for embedding processing
   * @example 'reviewed' - embedding processing completed
   */
  status: ModificationStatusType;

  /**
   * Record creation timestamp
   */
  createdAt: Date;

  /**
   * Last update timestamp
   */
  updatedAt: Date;

  /**
   * Soft delete timestamp - NULL means active record
   * Used for maintaining audit trail while removing inactive records
   */
  deletedAt?: Date | null;
}
