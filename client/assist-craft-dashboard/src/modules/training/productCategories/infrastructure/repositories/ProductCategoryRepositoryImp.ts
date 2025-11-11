import type {
  ProductCategoryDatasource,
  GetProductCategoriesRequest,
} from '@/modules/training/productCategories/domain/datasource/ProductCategoryDatasource';
import type { ProductCategoryRepository } from '@/modules/training/productCategories/domain/repositories/ProductCategoryRepository';

/**
 * Product Category Repository Implementation
 */
export class ProductCategoryRepositoryImp implements ProductCategoryRepository {
  constructor(
    private readonly productCategoryDatasource: ProductCategoryDatasource
  ) {}

  async getProductCategories(request: GetProductCategoriesRequest) {
    return this.productCategoryDatasource.getProductCategories(request);
  }
}
