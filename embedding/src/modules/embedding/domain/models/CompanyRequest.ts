import type { ModificationRequest } from '@modules/embedding/domain/models/ModificationRequest';

/**
 * Company Request Interface
 *
 * @description
 * Represents a company-specific batch processing request that links to a generic modification request
 */
export interface CompanyRequest {
  /** The company request ID */
  id: string;
  /** The modification request ID this company request is linked to */
  modificationRequestId: string;
  /** The modification request object with all its data */
  modificationRequest: ModificationRequest;
  /** When the company request was created */
  createdAt: Date;
  /** When the company request was last updated */
  updatedAt: Date;
  /** Soft delete timestamp */
  deletedAt?: Date | null;
}
