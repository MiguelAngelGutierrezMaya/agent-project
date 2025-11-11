import type { GetProductCategoriesRequest } from '@/modules/training/productCategories/domain/datasource/ProductCategoryDatasource';
import type { ProductCategoriesResponse } from '@/modules/training/productCategories/domain/models/ProductCategory';
import type { ProductCategoryRepository } from '@/modules/training/productCategories/domain/repositories/ProductCategoryRepository';

/**
 * Get Product Categories Use Case
 */
export class GetProductCategoriesUseCase {
  constructor(
    private readonly productCategoryRepository: ProductCategoryRepository
  ) {}

  async execute(
    request: GetProductCategoriesRequest
  ): Promise<ProductCategoriesResponse> {
    return this.productCategoryRepository.getProductCategories(request);
  }
}
