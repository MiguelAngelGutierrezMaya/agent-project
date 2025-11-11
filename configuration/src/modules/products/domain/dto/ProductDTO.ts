import { Product } from '@modules/products/domain/models/Product';
import { ProductDetailDTO } from '@modules/products/domain/dto/ProductDetailDTO';
import { DomainValidationError } from '@src/infrastructure/shared/utils/errors/domain';

export class ProductDTO {
  constructor(
    public readonly id: string,
    public readonly categoryId: string,
    public readonly name: string,
    public readonly type: 'product' | 'service',
    public readonly details: ProductDetailDTO,
    public readonly description?: string,
    public readonly imageUrl?: string,
    public readonly isEmbedded: boolean = false,
    public readonly isFeatured: boolean = false,
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date()
  ) {}

  static create(
    data: Record<string, string | boolean | Date | ProductDetailDTO>
  ): [ProductDTO?, DomainValidationError?] {
    const {
      id,
      categoryId,
      name,
      type,
      description,
      imageUrl,
      isEmbedded = false,
      isFeatured = false,
      createdAt = new Date(),
      updatedAt = new Date(),
      details,
    } = data;

    if (!id || !categoryId || !name || !type || !details) {
      return [
        undefined,
        new DomainValidationError(
          'Missing required fields: id, categoryId, name, type, details'
        ),
      ];
    }

    if (type !== 'product' && type !== 'service') {
      return [
        undefined,
        new DomainValidationError('Type must be product or service'),
      ];
    }

    return [
      new ProductDTO(
        id as string,
        categoryId as string,
        name as string,
        type as 'product' | 'service',
        details as ProductDetailDTO,
        description as string,
        imageUrl as string,
        isEmbedded as boolean,
        isFeatured as boolean,
        createdAt as Date,
        updatedAt as Date
      ),
      undefined,
    ];
  }

  public toDomain(): Product {
    return {
      id: this.id,
      categoryId: this.categoryId,
      name: this.name,
      type: this.type,
      description: this.description,
      imageUrl: this.imageUrl,
      isEmbedded: this.isEmbedded,
      isFeatured: this.isFeatured,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      details: this.details.toDomain(),
    };
  }
}
