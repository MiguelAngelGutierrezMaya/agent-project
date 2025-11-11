import { DomainValidationError } from '@src/infrastructure/shared/utils/errors/domain';
import { DocumentData } from '@modules/documents/domain/models/Document';

export class CreateDocumentDTO {
  constructor(
    public readonly userId: string,
    public readonly name: string,
    public readonly type: 'pdf' | 'url',
    public readonly url: string,
    public readonly isEmbedded: boolean = false
  ) {}

  static create(
    data: Record<string, string | boolean>
  ): [CreateDocumentDTO?, DomainValidationError?] {
    const { userId, name, type, url, isEmbedded = false } = data;

    if (!userId || !name || !type || !url) {
      return [undefined, new DomainValidationError('Missing required fields')];
    }

    if (type !== 'pdf' && type !== 'url') {
      return [undefined, new DomainValidationError('Type must be pdf or url')];
    }

    return [
      new CreateDocumentDTO(
        userId as string,
        name as string,
        type as 'pdf' | 'url',
        url as string,
        isEmbedded as boolean
      ),
      undefined,
    ];
  }

  toDomain(): DocumentData {
    return {
      name: this.name,
      type: this.type,
      url: this.url,
      isEmbedded: this.isEmbedded,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
}
