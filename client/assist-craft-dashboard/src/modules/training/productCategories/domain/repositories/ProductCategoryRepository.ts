import type { GetProductCategoriesRequest } from '@/modules/training/productCategories/domain/datasource/ProductCategoryDatasource';
import type { ProductCategoriesResponse } from '@/modules/training/productCategories/domain/models/ProductCategory';

/**
 * Product Category Repository Interface
 */
export interface ProductCategoryRepository {
  getProductCategories(
    request: GetProductCategoriesRequest
  ): Promise<ProductCategoriesResponse>;
}
