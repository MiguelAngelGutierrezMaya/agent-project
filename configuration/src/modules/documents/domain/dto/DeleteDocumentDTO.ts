import { DomainValidationError } from '@src/infrastructure/shared/utils/errors/domain';

export class DeleteDocumentDTO {
  constructor(
    public readonly userId: string,
    public readonly id: string
  ) {}

  static create(
    data: Record<string, string>
  ): [DeleteDocumentDTO?, DomainValidationError?] {
    const { userId, id } = data;

    if (!userId || !id) {
      return [
        undefined,
        new DomainValidationError('User ID and Document ID are required'),
      ];
    }

    return [new DeleteDocumentDTO(userId as string, id as string), undefined];
  }
}
