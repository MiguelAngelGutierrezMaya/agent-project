import type { UserApiRequest } from '@/modules/shared/domain/interfaces/ApiRequest';
import type { ProductCategoriesResponse } from '@/modules/training/productCategories/domain/models/ProductCategory';

/**
 * Get Product Categories Request
 */
export interface GetProductCategoriesRequest extends UserApiRequest {
  limit?: number;
  offset?: number;
}

/**
 * Product Category Datasource Interface
 */
export interface ProductCategoryDatasource {
  /**
   * Retrieve product categories from the data source
   * @param request - Request object with user identifier, token, and pagination options
   * @returns Promise that resolves to paginated product categories response
   */
  getProductCategories(
    request: GetProductCategoriesRequest
  ): Promise<ProductCategoriesResponse>;
}
