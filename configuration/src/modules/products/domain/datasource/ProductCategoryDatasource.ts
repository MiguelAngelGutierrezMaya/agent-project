import { ProductCategoriesResponse } from '@modules/products/domain/models/ProductCategory';

export interface ProductCategoryDatasource {
  getProductCategories(
    userId: string,
    limit?: number,
    offset?: number
  ): Promise<ProductCategoriesResponse>;
}
