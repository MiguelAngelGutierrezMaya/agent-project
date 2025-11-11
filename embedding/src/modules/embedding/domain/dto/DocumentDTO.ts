import { DomainValidationError } from '@src/infrastructure/shared/utils/errors/domain';
import type {
  Document,
  DatabaseDocumentData,
} from '@modules/embedding/domain/models/Document';

/**
 * Document DTO
 *
 * @description
 * Data Transfer Object for document data.
 * Validates data from database before converting to domain model.
 */
export class DocumentDTO {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly type: string,
    public readonly url: string,
    public readonly isEmbedded: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  /**
   * Create DTO from database record
   *
   * @param data Raw data from database
   * @returns Tuple of [DTO?, Error?]
   */
  static create(
    data: DatabaseDocumentData
  ): [DocumentDTO?, DomainValidationError?] {
    const id = data.id;
    const name = data.name;
    const type = data.type;
    const url = data.url;
    const isEmbedded = data.is_embedded;

    // Parse dates with validation
    const createdAt = new Date(data.created_at);
    const updatedAt = new Date(data.updated_at);

    /* Validate ONLY required fields from database schema */
    if (!id || !name || !type || !url) {
      return [
        undefined,
        new DomainValidationError(
          'Invalid document data: missing required fields (id, name, type, url)'
        ),
      ];
    }

    /* Validate dates are valid */
    if (isNaN(createdAt.getTime()) || isNaN(updatedAt.getTime())) {
      return [
        undefined,
        new DomainValidationError('Invalid document data: invalid date values'),
      ];
    }

    return [
      new DocumentDTO(id, name, type, url, isEmbedded, createdAt, updatedAt),
      undefined,
    ];
  }

  /**
   * Convert DTO to domain model
   *
   * @returns Document domain model
   */
  public toDomain(): Document {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      url: this.url,
      isEmbedded: this.isEmbedded,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
