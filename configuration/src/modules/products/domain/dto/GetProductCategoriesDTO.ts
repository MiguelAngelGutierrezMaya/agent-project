import { DomainValidationError } from '@src/infrastructure/shared/utils/errors/domain';

export class GetProductCategoriesDTO {
  constructor(
    public readonly userId: string,
    public readonly limit?: number,
    public readonly offset?: number
  ) {}

  static create(
    data: Record<string, any>
  ): [GetProductCategoriesDTO?, DomainValidationError?] {
    const { userId, limit, offset } = data;

    // Validate userId
    if (!userId) {
      return [undefined, new DomainValidationError('User ID is required')];
    }

    // Validate limit if provided
    if (limit !== undefined) {
      const limitNum = Number(limit);
      if (isNaN(limitNum) || limitNum < 1) {
        return [
          undefined,
          new DomainValidationError('Limit must be a positive number'),
        ];
      }
    }

    // Validate offset if provided
    if (offset !== undefined) {
      const offsetNum = Number(offset);
      if (isNaN(offsetNum) || offsetNum < 0) {
        return [
          undefined,
          new DomainValidationError('Offset must be a non-negative number'),
        ];
      }
    }

    return [
      new GetProductCategoriesDTO(
        userId as string,
        limit !== undefined ? Number(limit) : undefined,
        offset !== undefined ? Number(offset) : undefined
      ),
      undefined,
    ];
  }
}
