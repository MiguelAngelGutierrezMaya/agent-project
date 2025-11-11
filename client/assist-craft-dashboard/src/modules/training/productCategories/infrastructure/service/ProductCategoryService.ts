import { GetProductCategoriesUseCase } from '@/modules/training/productCategories/application/useCases/GetProductCategoriesUseCase';
import { GetProductCategoriesWithCacheUseCase } from '@/modules/training/productCategories/application/useCases/GetProductCategoriesWithCacheUseCase';
import type { GetProductCategoriesRequest } from '@/modules/training/productCategories/domain/datasource/ProductCategoryDatasource';
import { HttpProductCategoryDatasourceImp } from '@/modules/training/productCategories/infrastructure/datasource/HttpProductCategoryDatasourceImp';
import { LocalStorageProductCategoryStorageRepositoryImp } from '@/modules/training/productCategories/infrastructure/repositories/LocalStorageProductCategoryStorageRepositoryImp';
import { ProductCategoryRepositoryImp } from '@/modules/training/productCategories/infrastructure/repositories/ProductCategoryRepositoryImp';

/**
 * Product Category Service
 * Orchestrates product category operations using use cases
 */
export class ProductCategoryService {
  private getProductCategoriesWithCacheUseCase: GetProductCategoriesWithCacheUseCase;

  constructor(apiBaseUrl: string) {
    /* Initialize datasource */
    const productCategoryDatasource = new HttpProductCategoryDatasourceImp(
      apiBaseUrl
    );

    /* Initialize repository */
    const productCategoryRepository = new ProductCategoryRepositoryImp(
      productCategoryDatasource
    );

    /* Initialize storage repository */
    const storageRepository =
      new LocalStorageProductCategoryStorageRepositoryImp();

    /* Initialize cache use case */
    const getProductCategoriesUseCase = new GetProductCategoriesUseCase(
      productCategoryRepository
    );

    /* Initialize use cases */
    this.getProductCategoriesWithCacheUseCase =
      new GetProductCategoriesWithCacheUseCase(
        (request: GetProductCategoriesRequest) =>
          getProductCategoriesUseCase.execute(request),
        storageRepository
      );
  }

  /**
   * Get product categories for a user with cache support
   * @param request - Request object with user identifier, token, and pagination options
   * @returns Promise that resolves to product categories response
   */
  async getProductCategories(request: GetProductCategoriesRequest) {
    return this.getProductCategoriesWithCacheUseCase.execute(request);
  }

  /**
   * Clear product category cache
   */
  clearCache(): void {
    this.getProductCategoriesWithCacheUseCase.clearCache();
  }
}
