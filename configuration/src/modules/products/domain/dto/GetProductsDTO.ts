import { DomainValidationError } from '@src/infrastructure/shared/utils/errors/domain';

export class GetProductsDTO {
  constructor(
    public readonly userId: string,
    public readonly limit?: number,
    public readonly offset?: number
  ) {}

  static create(
    data: Record<string, string | number | undefined>
  ): [GetProductsDTO?, DomainValidationError?] {
    const { userId, limit, offset } = data;

    if (!userId) {
      return [undefined, new DomainValidationError('User ID is required')];
    }

    const parsedLimit = limit ? Number(limit) : undefined;
    const parsedOffset = offset ? Number(offset) : undefined;

    if (parsedLimit !== undefined && (parsedLimit < 1 || parsedLimit > 100)) {
      return [
        undefined,
        new DomainValidationError('Limit must be between 1 and 100'),
      ];
    }

    if (parsedOffset !== undefined && parsedOffset < 0) {
      return [
        undefined,
        new DomainValidationError('Offset must be 0 or greater'),
      ];
    }

    return [
      new GetProductsDTO(userId as string, parsedLimit, parsedOffset),
      undefined,
    ];
  }
}
