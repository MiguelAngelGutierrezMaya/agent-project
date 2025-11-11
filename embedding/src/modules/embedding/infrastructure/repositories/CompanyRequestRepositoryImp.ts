import { CompanyRequestRepository } from '@modules/embedding/domain/repositories/CompanyRequestRepository';
import { CompanyRequestDatasource } from '@modules/embedding/domain/datasource/CompanyRequestDatasource';

/**
 * Company Request Repository Implementation
 *
 * @description
 * Implementation of CompanyRequestRepository.
 * Delegates data operations to datasource.
 */
export class CompanyRequestRepositoryImp implements CompanyRequestRepository {
  private companyRequestDatasource: CompanyRequestDatasource;

  constructor(companyRequestDatasource: CompanyRequestDatasource) {
    this.companyRequestDatasource = companyRequestDatasource;
  }

  async createCompanyRequest(
    schemaName: string,
    tableName: string
  ): Promise<string> {
    return this.companyRequestDatasource.createCompanyRequest(
      schemaName,
      tableName
    );
  }

  async getPendingBatchRequests() {
    return this.companyRequestDatasource.getPendingBatchRequests();
  }

  async markAsReviewed(companyRequestId: string): Promise<void> {
    return this.companyRequestDatasource.markAsReviewed(companyRequestId);
  }
}
