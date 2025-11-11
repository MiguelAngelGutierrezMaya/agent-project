import { ProductCategoriesResponse } from '@modules/products/domain/models/ProductCategory';

export interface ProductCategoryRepository {
  getProductCategories(
    userId: string,
    limit?: number,
    offset?: number
  ): Promise<ProductCategoriesResponse>;
}
