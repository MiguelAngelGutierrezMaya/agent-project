import { DomainValidationError } from '@src/infrastructure/shared/utils/errors/domain';

export class GetConfigDto {
  constructor(public readonly userId: string) {}

  static create(userId: string): [GetConfigDto?, DomainValidationError?] {
    if (!userId) {
      return [undefined, new DomainValidationError('User ID is required')];
    }

    return [new GetConfigDto(userId), undefined];
  }
}
