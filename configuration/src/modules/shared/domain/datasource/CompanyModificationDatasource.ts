/**
 * Company Modification Datasource Interface
 *
 * @description
 * Defines the contract for company modification data operations.
 * Handles CRUD operations for company modifications.
 */
export interface CompanyModificationDatasource {
  /**
   * Record a modification for a specific table
   * @param userId - Clerk user ID
   * @param tableName - Name of the table that was modified
   * @param status - Status of the modification (pending, reviewed)
   * @returns Promise<void>
   */
  recordModification(
    userId: string,
    tableName: string,
    status?: 'pending' | 'reviewed'
  ): Promise<void>;
}
