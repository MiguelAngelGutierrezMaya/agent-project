import type { UserApiRequest } from '@/modules/shared/domain/interfaces/ApiRequest';
import type {
  Product,
  ProductType,
  ProductsResponse,
} from '@/modules/training/products/domain/models/Product';

/**
 * Product Detail for creation
 */
export interface CreateProductDetail {
  /** Product price (must be >= 0) */
  price: number;
  /** Currency code (ISO 4217, e.g., USD, EUR, MXN) */
  currency: string;
  /** Detailed product description with specifications and features */
  detailedDescription?: string;
}

/**
 * Product Detail for update
 */
export interface UpdateProductDetail {
  /** Product price (must be >= 0) */
  price?: number;
  /** Currency code (ISO 4217, e.g., USD, EUR, MXN) */
  currency?: string;
  /** Detailed product description with specifications and features */
  detailedDescription?: string;
}

/**
 * Get Products Request
 */
export interface GetProductsRequest extends UserApiRequest {
  limit?: number;
  offset?: number;
}

/**
 * Create Product Request
 */
export interface CreateProductRequest extends UserApiRequest {
  /** Category identifier this product belongs to */
  categoryId: string;
  /** Name of the product */
  name: string;
  /** Type of product (physical product or service) */
  type: ProductType;
  /** Optional description of the product */
  description?: string;
  /** Optional image URL for the product */
  imageUrl?: string | null;
  /** Whether the product is embedded */
  isEmbedded?: boolean;
  /** Whether the product is featured */
  isFeatured?: boolean;
  /** Product details (pricing and detailed information) */
  details: CreateProductDetail;
}

/**
 * Update Product Request
 */
export interface UpdateProductRequest extends UserApiRequest {
  /** Product identifier */
  id: string;
  /** Category identifier this product belongs to */
  categoryId?: string;
  /** Name of the product */
  name?: string;
  /** Type of product (physical product or service) */
  type?: ProductType;
  /** Optional description of the product */
  description?: string;
  /** Optional image URL for the product */
  imageUrl?: string | null;
  /** Whether the product is embedded */
  isEmbedded?: boolean;
  /** Whether the product is featured */
  isFeatured?: boolean;
  /** Product details (pricing and detailed information) */
  details?: UpdateProductDetail;
}

/**
 * Delete Product Request
 */
export interface DeleteProductRequest extends UserApiRequest {
  /** Product identifier */
  id: string;
}

/**
 * Product Datasource Interface
 * Defines the contract for data source operations
 */
export interface ProductDatasource {
  /**
   * Retrieve products from the data source
   * @param request - Request object with user identifier, token, and pagination options
   * @returns Promise that resolves to paginated products response
   */
  getProducts(request: GetProductsRequest): Promise<ProductsResponse>;

  /**
   * Create a new product in the data source
   * @param request - Request object with user identifier, token, and product data
   * @returns Promise that resolves to created product
   */
  createProduct(request: CreateProductRequest): Promise<Product>;

  /**
   * Update a product in the data source
   * @param request - Request object with user identifier, token, product id, and update data
   * @returns Promise that resolves to updated product
   */
  updateProduct(request: UpdateProductRequest): Promise<Product>;

  /**
   * Delete a product from the data source
   * @param request - Request object with user identifier, token, and product id
   * @returns Promise that resolves when product is deleted
   */
  deleteProduct(request: DeleteProductRequest): Promise<void>;
}
