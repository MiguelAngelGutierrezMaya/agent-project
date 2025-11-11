import { DomainValidationError } from '@src/infrastructure/shared/utils/errors/domain';
import type { CompanyModification } from '@modules/embedding/domain/models/CompanyModification';
import { ModificationRequestDTO } from './ModificationRequestDTO';

/**
 * Company Modification DTO
 *
 * @description
 * Data Transfer Object for company modification data.
 * Now includes the related modification request data.
 */
export class CompanyModificationDTO {
  constructor(
    public readonly id: string,
    public readonly modificationRequestId: string,
    public readonly modificationRequest: ModificationRequestDTO,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly deletedAt?: Date | null
  ) {}

  /**
   * Create DTO from database record with joined modification_requests data
   *
   * @param data Raw data from database (company_modifications table joined with modification_requests)
   * @returns Tuple of [DTO?, Error?]
   */
  static create(
    data: Record<string, string | Date | null>
  ): [CompanyModificationDTO?, DomainValidationError?] {
    const id = data.id;
    const modificationRequestId = data.modification_request_id;
    const createdAt = data.created_at as Date;
    const updatedAt = data.updated_at as Date;
    const deletedAt = data.deleted_at as Date | null;

    /* Validate required fields for company_modifications */
    if (!id || !modificationRequestId || !createdAt || !updatedAt) {
      return [
        undefined,
        new DomainValidationError('Invalid company modification data'),
      ];
    }

    // Create ModificationRequestDTO from the joined data
    const [modificationRequestDTO, modificationRequestError] =
      ModificationRequestDTO.create({
        id: data.modification_request_mr_id,
        schema_name: data.schema_name,
        table_name: data.table_name,
        status: data.status,
        created_at: data.mr_created_at,
        updated_at: data.mr_updated_at,
        deleted_at: data.mr_deleted_at,
      });

    if (modificationRequestError) {
      return [undefined, modificationRequestError];
    }

    return [
      new CompanyModificationDTO(
        id as string,
        modificationRequestId as string,
        modificationRequestDTO!,
        createdAt as Date,
        updatedAt as Date,
        deletedAt
      ),
      undefined,
    ];
  }

  /**
   * Convert DTO to domain model
   *
   * @returns CompanyModification domain model
   */
  public toDomain(): CompanyModification {
    return {
      id: this.id,
      modificationRequestId: this.modificationRequestId,
      modificationRequest: this.modificationRequest.toDomain(),
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      deletedAt: this.deletedAt,
    };
  }
}
