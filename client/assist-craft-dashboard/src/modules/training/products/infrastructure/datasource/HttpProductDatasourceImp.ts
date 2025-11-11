import type {
  ProductDatasource,
  GetProductsRequest,
  CreateProductRequest,
  UpdateProductRequest,
  DeleteProductRequest,
} from '@/modules/training/products/domain/datasource/ProductDatasource';
import type {
  Product,
  ProductsResponse,
} from '@/modules/training/products/domain/models/Product';

/**
 * API Response interface
 */
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

/**
 * HTTP Product Datasource Implementation
 */
export class HttpProductDatasourceImp implements ProductDatasource {
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

  async getProducts(request: GetProductsRequest): Promise<ProductsResponse> {
    try {
      const queryParams = this.buildQueryString({
        userId: request.userId,
        limit: request.limit,
        offset: request.offset,
      });

      const response = await fetch(
        `${this.apiBaseUrl}/products?${queryParams}`,
        {
          method: 'GET',
          headers: this.getAuthHeaders(request.token),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to fetch products: ${response.status} ${errorText}`
        );
      }

      const apiResponse =
        (await response.json()) as ApiResponse<ProductsResponse>;

      if (!apiResponse.success || !apiResponse.data) {
        throw new Error('Invalid response format from API');
      }

      /* Return the response data directly as it matches the ProductsResponse interface */
      return apiResponse.data;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      console.error(
        '[HttpProductDatasourceImp] Error fetching products:',
        errorMessage
      );
      throw error;
    }
  }

  async createProduct(request: CreateProductRequest): Promise<Product> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/products`, {
        method: 'POST',
        headers: this.getAuthHeaders(request.token),
        body: JSON.stringify({
          userId: request.userId,
          categoryId: request.categoryId,
          name: request.name,
          type: request.type,
          description: request.description,
          imageUrl: request.imageUrl,
          isEmbedded: request.isEmbedded ?? false,
          isFeatured: request.isFeatured ?? false,
          details: request.details,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to create product: ${response.status} ${errorText}`
        );
      }

      const data = (await response.json()) as ApiResponse<Product>;

      if (!data.success || !data.data) {
        throw new Error('Invalid response format from API');
      }

      return data.data;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      console.error(
        '[HttpProductDatasourceImp] Error creating product:',
        errorMessage
      );
      throw error;
    }
  }

  async updateProduct(request: UpdateProductRequest): Promise<Product> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/products`, {
        method: 'PUT',
        headers: this.getAuthHeaders(request.token),
        body: JSON.stringify({
          userId: request.userId,
          id: request.id,
          categoryId: request.categoryId,
          name: request.name,
          type: request.type,
          description: request.description,
          imageUrl: request.imageUrl,
          isEmbedded: request.isEmbedded,
          isFeatured: request.isFeatured,
          details: request.details,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to update product: ${response.status} ${errorText}`
        );
      }

      const data = (await response.json()) as ApiResponse<Product>;

      if (!data.success || !data.data) {
        throw new Error('Invalid response format from API');
      }

      return data.data;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      console.error(
        '[HttpProductDatasourceImp] Error updating product:',
        errorMessage
      );
      throw error;
    }
  }

  async deleteProduct(request: DeleteProductRequest): Promise<void> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/products`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(request.token),
        body: JSON.stringify({
          userId: request.userId,
          id: request.id,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to delete product: ${response.status} ${errorText}`
        );
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      console.error(
        '[HttpProductDatasourceImp] Error deleting product:',
        errorMessage
      );
      throw error;
    }
  }
}
