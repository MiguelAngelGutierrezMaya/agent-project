import { PendingModificationWithConfig } from '@modules/embedding/domain/models/PendingModificationWithConfig';

/**
 * Company Modification Repository Interface
 *
 * @description
 * Defines contracts for company modification business logic operations
 */
export interface CompanyModificationRepository {
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
