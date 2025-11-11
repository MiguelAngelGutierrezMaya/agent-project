import { PendingModificationWithConfig } from '@modules/embedding/domain/models/PendingModificationWithConfig';

/**
 * Company Modification Datasource Interface
 *
 * @description
 * Defines the contract for company modification data operations.
 * Handles queries for pending modifications and AI configurations.
 */
export interface CompanyModificationDatasource {
  /**
   * Get pending modifications with their AI configurations
   * @returns Promise<PendingModificationWithConfig[]> - Combined data
   */
  getPendingModificationsWithConfig(): Promise<PendingModificationWithConfig[]>;

  /**
   * Mark a modification as reviewed by company modification ID
   * @param companyModificationId - The company modification ID
   * @returns Promise<void>
   */
  markAsReviewed(companyModificationId: string): Promise<void>;
}
