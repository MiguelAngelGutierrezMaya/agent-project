import type { ModificationRequest } from './ModificationRequest';

/**
 * Company Modification Model
 *
 * @description
 * Represents a company modification record that links to a modification request.
 * This is the actual structure of the company_modifications table in the database.
 *
 * The table has a foreign key to modification_requests which contains
 * the actual schema, table, and status information.
 */
export interface CompanyModification {
  /**
   * Unique identifier for the company modification record
   */
  id: string;

  /**
   * Foreign key to modification_requests table
   */
  modificationRequestId: string;

  /**
   * Related modification request containing schema, table, and status info
   */
  modificationRequest: ModificationRequest;

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
