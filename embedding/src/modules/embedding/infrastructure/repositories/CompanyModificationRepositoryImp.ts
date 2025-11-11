import { CompanyModificationRepository } from '@modules/embedding/domain/repositories/CompanyModificationRepository';
import { PendingModificationWithConfig } from '@modules/embedding/domain/models/PendingModificationWithConfig';
import { CompanyModificationDatasource } from '@modules/embedding/domain/datasource/CompanyModificationDatasource';

/**
 * Implementation of the CompanyModificationRepository interface
 * Delegates company modification operations to the datasource layer
 */
export class CompanyModificationRepositoryImp
  implements CompanyModificationRepository
{
  /**
   * Creates a new CompanyModificationRepositoryImp instance
   * @param companyModificationDatasource - The datasource implementation for company modification operations
   */
  constructor(
    private readonly companyModificationDatasource: CompanyModificationDatasource
  ) {}

  /**
   * Get pending modifications with their AI configurations
   * @returns Promise<PendingModificationWithConfig[]> - Combined data
   */
  async getPendingModificationsWithConfig(): Promise<
    PendingModificationWithConfig[]
  > {
    return this.companyModificationDatasource.getPendingModificationsWithConfig();
  }

  /**
   * Mark a modification as reviewed by company modification ID
   * @param companyModificationId - The company modification ID
   * @returns Promise<void>
   */
  async markAsReviewed(companyModificationId: string): Promise<void> {
    return this.companyModificationDatasource.markAsReviewed(
      companyModificationId
    );
  }
}
