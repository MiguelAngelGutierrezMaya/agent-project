import { DomainValidationError } from '@src/infrastructure/shared/utils/errors/domain';

export class DeleteProductDTO {
  constructor(
    public readonly userId: string,
    public readonly id: string
  ) {}

  static create(
    data: Record<string, string>
  ): [DeleteProductDTO?, DomainValidationError?] {
    const { userId, id } = data;

    if (!userId || !id) {
      return [
        undefined,
        new DomainValidationError('User ID and Product ID are required'),
      ];
    }

    return [new DeleteProductDTO(userId as string, id as string), undefined];
  }
}
