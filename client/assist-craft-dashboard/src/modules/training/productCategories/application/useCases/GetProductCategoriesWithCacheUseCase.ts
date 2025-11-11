import type { GetProductCategoriesRequest } from '@/modules/training/productCategories/domain/datasource/ProductCategoryDatasource';
import type { ProductCategoriesResponse } from '@/modules/training/productCategories/domain/models/ProductCategory';
import type { ProductCategoryStorageRepository } from '@/modules/training/productCategories/domain/repositories/ProductCategoryStorageRepository';

/**
 * Use case for retrieving product categories with cache support
 * Orchestrates the product category retrieval business logic with caching
 */
export class GetProductCategoriesWithCacheUseCase {
  /**
   * Creates a new GetProductCategoriesWithCacheUseCase instance
   * @param getProductCategories - Function to get product categories from API
   * @param storageRepository - The repository for cache operations
   */
  constructor(
    private readonly getProductCategories: (
      request: GetProductCategoriesRequest
    ) => Promise<ProductCategoriesResponse>,
    private readonly storageRepository: ProductCategoryStorageRepository
  ) {}

  /**
   * Executes the product category retrieval use case with cache
   * @param request - Request object with user identifier, token, and pagination options
   * @returns Promise that resolves to product categories response
   */
  async execute(
    request: GetProductCategoriesRequest
  ): Promise<ProductCategoriesResponse> {
    /* Try to get from cache first */
    if (this.storageRepository.isCacheValid()) {
      const cached = this.storageRepository.getCachedCategories();
      if (cached) {
        return cached;
      }
    }

    /* Fetch from API if cache is invalid or missing */
    const categories = await this.getProductCategories(request);

    /* Save to cache */
    this.storageRepository.saveToCache(categories);

    return categories;
  }

  /**
   * Clear cache manually
   */
  clearCache(): void {
    this.storageRepository.clearCache();
  }
}
