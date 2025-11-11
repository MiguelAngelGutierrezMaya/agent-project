import type { CompanyRequest } from '@modules/embedding/domain/models/CompanyRequest';

/**
 * Company Request Datasource Interface
 *
 * @description
 * Port (interface) for company request data operations.
 * Defines the contract for company request persistence operations.
 */
export interface CompanyRequestDatasource {
  /**
   * Create a company request record
   *
   * @param schemaName - The schema name
   * @param tableName - The table name
   * @returns Promise<string> - The created company request ID
   */
  createCompanyRequest(schemaName: string, tableName: string): Promise<string>;

  /**
   * Get all pending batch requests that need to be checked for completion
   *
   * @returns Promise<CompanyRequest[]> - List of pending company requests
   */
  getPendingBatchRequests(): Promise<CompanyRequest[]>;

  /**
   * Mark a company request as reviewed/completed by updating the associated modification request status
   *
   * @param companyRequestId - The company request ID to mark as reviewed
   * @returns Promise<void>
   */
  markAsReviewed(companyRequestId: string): Promise<void>;
}
