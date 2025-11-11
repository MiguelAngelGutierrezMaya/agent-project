import { ProductCategory } from '@modules/products/domain/models/ProductCategory';
import { DomainValidationError } from '@src/infrastructure/shared/utils/errors/domain';

export class ProductCategoryDTO {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly description?: string,
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date()
  ) {}

  static create(
    data: Record<string, string | Date>
  ): [ProductCategoryDTO?, DomainValidationError?] {
    const {
      id,
      name,
      description,
      createdAt = new Date(),
      updatedAt = new Date(),
    } = data;

    if (!id || !name) {
      return [undefined, new DomainValidationError('Missing required fields')];
    }

    return [
      new ProductCategoryDTO(
        id as string,
        name as string,
        description as string,
        createdAt as Date,
        updatedAt as Date
      ),
      undefined,
    ];
  }

  public toDomain(): ProductCategory {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
