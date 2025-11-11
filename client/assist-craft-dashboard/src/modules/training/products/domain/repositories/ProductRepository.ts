import type {
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
 * Product Repository Interface
 * Defines the contract for product data operations
 */
export interface ProductRepository {
  getProducts(request: GetProductsRequest): Promise<ProductsResponse>;
  createProduct(request: CreateProductRequest): Promise<Product>;
  updateProduct(request: UpdateProductRequest): Promise<Product>;
  deleteProduct(request: DeleteProductRequest): Promise<void>;
}
