import { DomainValidationError } from '@src/infrastructure/shared/utils/errors/domain';
import type {
  ModificationRequest,
  ModificationStatusType,
} from '@modules/embedding/domain/models/ModificationRequest';

/**
 * Modification Request DTO
 *
 * @description
 * Data Transfer Object for modification request data.
 * Represents the generic modification_requests table data.
 */
export class ModificationRequestDTO {
  constructor(
    public readonly id: string,
    public readonly schemaName: string,
    public readonly tableName: string,
    public readonly status: ModificationStatusType,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly deletedAt?: Date | null
  ) {}

  /**
   * Create DTO from database record
   *
   * @param data Raw data from database
   * @returns Tuple of [DTO?, Error?]
   */
  static create(
    data: Record<string, string | Date | null | undefined>
  ): [ModificationRequestDTO?, DomainValidationError?] {
    const id = data.id;
    const schemaName = data.schema_name as string;
    const tableName = data.table_name as string;
    const status = data.status as ModificationStatusType;
    const createdAt = data.created_at as Date;
    const updatedAt = data.updated_at as Date;
    const deletedAt = data.deleted_at as Date | null;

    /* Validate required fields */
    if (
      !id ||
      !schemaName ||
      !tableName ||
      !status ||
      !createdAt ||
      !updatedAt
    ) {
      return [
        undefined,
        new DomainValidationError('Invalid modification request data'),
      ];
    }

    /* Validate status */
    const validStatuses = ['pending', 'reviewed'];
    if (!validStatuses.includes(status)) {
      return [
        undefined,
        new DomainValidationError(
          'Invalid status. Must be one of: pending, reviewed'
        ),
      ];
    }

    return [
      new ModificationRequestDTO(
        id as string,
        schemaName,
        tableName,
        status,
        createdAt as Date,
        updatedAt as Date,
        deletedAt
      ),
      undefined,
    ];
  }

  /**
   * Convert DTO to ModificationRequest domain model
   *
   * @returns ModificationRequest domain model
   */
  public toDomain(): ModificationRequest {
    return {
      id: this.id,
      schemaName: this.schemaName,
      tableName: this.tableName,
      status: this.status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      deletedAt: this.deletedAt,
    };
  }
}
