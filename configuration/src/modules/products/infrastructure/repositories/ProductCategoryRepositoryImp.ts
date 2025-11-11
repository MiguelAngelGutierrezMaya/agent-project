import { ProductCategoryRepository } from '@modules/products/domain/repositories/ProductCategoryRepository';
import { ProductCategoryDatasource } from '@modules/products/domain/datasource/ProductCategoryDatasource';
import { ProductCategoriesResponse } from '@modules/products/domain/models/ProductCategory';

export class ProductCategoryRepositoryImp implements ProductCategoryRepository {
  constructor(
    private readonly productCategoryDatasource: ProductCategoryDatasource
  ) {}

  async getProductCategories(
    userId: string,
    limit?: number,
    offset?: number
  ): Promise<ProductCategoriesResponse> {
    return this.productCategoryDatasource.getProductCategories(
      userId,
      limit,
      offset
    );
  }
}
