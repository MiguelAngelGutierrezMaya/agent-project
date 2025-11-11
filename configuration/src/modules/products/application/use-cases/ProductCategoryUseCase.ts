import { ProductCategoryRepository } from '@modules/products/domain/repositories/ProductCategoryRepository';
import { ProductCategoriesResponse } from '@modules/products/domain/models/ProductCategory';

export class GetProductCategoriesUseCase {
  constructor(
    private readonly productCategoryRepository: ProductCategoryRepository
  ) {}

  async execute(
    userId: string,
    limit?: number,
    offset?: number
  ): Promise<ProductCategoriesResponse> {
    return this.productCategoryRepository.getProductCategories(
      userId,
      limit,
      offset
    );
  }
}
