import { DomainValidationError } from '@src/infrastructure/shared/utils/errors/domain';

export class UpdateProductDetailDTO {
  constructor(
    public readonly price?: number,
    public readonly currency?: string,
    public readonly detailedDescription?: string
  ) {}

  static create(
    data: Record<string, string | number>
  ): [UpdateProductDetailDTO?, DomainValidationError?] {
    const { price, currency, detailedDescription } = data;

    // Validate price if provided
    if (price !== undefined) {
      if (typeof price !== 'number' || price < 0) {
        return [
          undefined,
          new DomainValidationError('Price must be a number >= 0'),
        ];
      }
    }

    // Validate currency if provided
    if (currency !== undefined) {
      if (typeof currency !== 'string' || currency.length !== 3) {
        return [
          undefined,
          new DomainValidationError(
            'Currency must be a 3-character string (ISO 4217)'
          ),
        ];
      }
    }

    // Validate detailedDescription if provided
    if (detailedDescription !== undefined && detailedDescription !== null) {
      if (typeof detailedDescription !== 'string') {
        return [
          undefined,
          new DomainValidationError('Detailed description must be a string'),
        ];
      }
    }

    return [
      new UpdateProductDetailDTO(
        price as number,
        currency as string,
        detailedDescription as string
      ),
      undefined,
    ];
  }

  public hasAnyField(): boolean {
    return (
      this.price !== undefined ||
      this.currency !== undefined ||
      this.detailedDescription !== undefined
    );
  }
}
