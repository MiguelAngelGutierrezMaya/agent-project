import { Document } from '@modules/documents/domain/models/Document';
import { DomainValidationError } from '@src/infrastructure/shared/utils/errors/domain';

export class DocumentDTO {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly type: 'pdf' | 'url',
    public readonly url: string,
    public readonly isEmbedded: boolean = false,
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date()
  ) {}

  static create(
    data: Record<string, string | boolean | Date>
  ): [DocumentDTO?, DomainValidationError?] {
    const {
      id,
      name,
      type,
      url,
      isEmbedded = false,
      createdAt = new Date(),
      updatedAt = new Date(),
    } = data;

    if (!id || !name || !type || !url) {
      return [undefined, new DomainValidationError('Missing required fields')];
    }

    if (type !== 'pdf' && type !== 'url') {
      return [undefined, new DomainValidationError('Type must be pdf or url')];
    }

    return [
      new DocumentDTO(
        id as string,
        name as string,
        type as 'pdf' | 'url',
        url as string,
        isEmbedded as boolean,
        createdAt as Date,
        updatedAt as Date
      ),
      undefined,
    ];
  }

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
