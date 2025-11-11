import { ProductDetail } from '@modules/products/domain/models/Product';
import { DomainValidationError } from '@src/infrastructure/shared/utils/errors/domain';

export class ProductDetailDTO {
  constructor(
    public readonly id: string,
    public readonly price: number,
    public readonly currency: string,
    public readonly detailedDescription?: string,
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date()
  ) {}

  static create(
    data: Record<string, string | number | Date>
  ): [ProductDetailDTO?, DomainValidationError?] {
    const {
      id,
      price,
      currency,
      detailedDescription,
      createdAt = new Date(),
      updatedAt = new Date(),
    } = data;

    if (!id || price === undefined || !currency) {
      return [
        undefined,
        new DomainValidationError(
          'Missing required fields: id, price, currency'
        ),
      ];
    }

    if (typeof price !== 'number' || price < 0) {
      return [
        undefined,
        new DomainValidationError('Price must be a number >= 0'),
      ];
    }

    if (typeof currency !== 'string' || currency.length !== 3) {
      return [
        undefined,
        new DomainValidationError(
          'Currency must be a 3-character string (ISO 4217)'
        ),
      ];
    }

    return [
      new ProductDetailDTO(
        id as string,
        price as number,
        currency as string,
        detailedDescription as string,
        createdAt as Date,
        updatedAt as Date
      ),
      undefined,
    ];
  }

  public toDomain(): ProductDetail {
    return {
      id: this.id,
      price: this.price,
      currency: this.currency,
      detailedDescription: this.detailedDescription,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
