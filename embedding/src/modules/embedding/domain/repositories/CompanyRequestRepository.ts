import type { CompanyRequest } from '@modules/embedding/domain/models/CompanyRequest';

/**
 * Company Request Repository Interface
 *
 * @description
 * Port (interface) for company request operations.
 * Defines the contract for company request business operations.
 */
export interface CompanyRequestRepository {
  /**
   * Create a company request
   *
   * @param schemaName - The schema name
   * @param tableName - The table name
   * @returns Promise<string> - The created company request ID
   */
  createCompanyRequest(schemaName: string, tableName: string): Promise<string>;

  /**
   * Get all pending batch requests
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
