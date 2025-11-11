import { DomainValidationError } from '@src/infrastructure/shared/utils/errors/domain';
import { Document } from '@modules/documents/domain/models/Document';

export class UpdateDocumentDTO {
  constructor(
    public readonly userId: string,
    public readonly id: string,
    public readonly name?: string,
    public readonly type?: 'pdf' | 'url',
    public readonly url?: string,
    public readonly isEmbedded?: boolean
  ) {}

  static create(
    data: Record<string, string | boolean>
  ): [UpdateDocumentDTO?, DomainValidationError?] {
    const { userId, id, name, type, url, isEmbedded } = data;

    if (!userId || !id) {
      return [
        undefined,
        new DomainValidationError('User ID and Document ID are required'),
      ];
    }

    if (type && type !== 'pdf' && type !== 'url') {
      return [undefined, new DomainValidationError('Type must be pdf or url')];
    }

    return [
      new UpdateDocumentDTO(
        userId as string,
        id as string,
        name as string,
        type as 'pdf' | 'url',
        url as string,
        isEmbedded as boolean
      ),
      undefined,
    ];
  }

  toDomain(): Document {
    return {
      id: this.id,
      name: this.name || '',
      type: this.type || 'pdf',
      url: this.url || '',
      isEmbedded: this.isEmbedded || false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
}
