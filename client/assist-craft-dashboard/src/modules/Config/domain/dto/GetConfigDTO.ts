import { DomainValidationError } from '@/modules/shared/domain/errors/DomainValidationError';

/**
 * Get Config DTO
 */
export class GetConfigDto {
  constructor(public readonly userId: string) {}

  /**
   * Create DTO from data
   * @param userId User identifier
   * @returns Tuple of [DTO?, Error?]
   */
  static create(userId: string): [GetConfigDto?, DomainValidationError?] {
    if (!userId) {
      return [undefined, new DomainValidationError('User ID is required')];
    }

    return [new GetConfigDto(userId), undefined];
  }
}
