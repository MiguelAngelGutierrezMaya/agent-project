import type {
  ProductCategoryDatasource,
  GetProductCategoriesRequest,
} from '@/modules/training/productCategories/domain/datasource/ProductCategoryDatasource';
import type { ProductCategoriesResponse } from '@/modules/training/productCategories/domain/models/ProductCategory';

/**
 * API Response interface
 */
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

/**
 * HTTP Product Category Datasource Implementation
 */
export class HttpProductCategoryDatasourceImp
  implements ProductCategoryDatasource
{
  private readonly apiBaseUrl: string;

  constructor(apiBaseUrl: string) {
    this.apiBaseUrl = apiBaseUrl;
  }

  private getAuthHeaders(token: string): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
  }

  private buildQueryString(
    params: Record<string, string | number | undefined>
  ): string {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, String(value));
      }
    });
    return queryParams.toString();
  }

  async getProductCategories(
    request: GetProductCategoriesRequest
  ): Promise<ProductCategoriesResponse> {
    try {
      const queryParams = this.buildQueryString({
        userId: request.userId,
        limit: request.limit,
        offset: request.offset,
      });

      const response = await fetch(
        `${this.apiBaseUrl}/products/categories?${queryParams}`,
        {
          method: 'GET',
          headers: this.getAuthHeaders(request.token),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to fetch product categories: ${response.status} ${errorText}`
        );
      }

      const apiResponse =
        (await response.json()) as ApiResponse<ProductCategoriesResponse>;

      if (!apiResponse.success || !apiResponse.data) {
        throw new Error('Invalid response format from API');
      }

      /* Return the response data directly as it matches the ProductCategoriesResponse interface */
      return apiResponse.data;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      console.error(
        '[HttpProductCategoryDatasourceImp] Error fetching product categories:',
        errorMessage
      );
      throw error;
    }
  }
}
