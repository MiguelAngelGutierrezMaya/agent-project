import {
  Product,
  ProductsResponse,
} from '@modules/products/domain/models/Product';
import { CreateProductDTO } from '@modules/products/domain/dto/CreateProductDTO';
import { UpdateProductDTO } from '@modules/products/domain/dto/UpdateProductDTO';
import { DeleteProductDTO } from '@modules/products/domain/dto/DeleteProductDTO';

/**
 * Interface for product data source operations
 * Defines contracts for product persistence operations
 */
export interface ProductDatasource {
  /**
   * Retrieves paginated list of products for a user
   * @param userId - User identifier for product retrieval
   * @param limit - Maximum number of products to return
   * @param offset - Number of products to skip for pagination
   * @returns Promise that resolves to paginated products response
   */
  getProducts(
    userId: string,
    limit?: number,
    offset?: number
  ): Promise<ProductsResponse>;

  /**
   * Creates a new product for a user
   * @param userId - User identifier for product creation
   * @param productData - Product data to create
   * @returns Promise that resolves to the created product
   */
  createProduct(
    userId: string,
    productData: CreateProductDTO
  ): Promise<Product>;

  /**
   * Updates an existing product for a user
   * @param userId - User identifier for product update
   * @param productData - Product data to update
   * @returns Promise that resolves to the updated product
   */
  updateProduct(
    userId: string,
    productData: UpdateProductDTO
  ): Promise<Product>;

  /**
   * Deletes a product for a user
   * @param userId - User identifier for product deletion
   * @param productData - Product data containing deletion information
   * @returns Promise that resolves when deletion is complete
   */
  deleteProduct(userId: string, productData: DeleteProductDTO): Promise<void>;
}
