import { ProductRepository } from '@modules/products/domain/repositories/ProductRepository';
import {
  Product,
  ProductsResponse,
} from '@modules/products/domain/models/Product';
import { CreateProductDTO } from '@modules/products/domain/dto/CreateProductDTO';
import { UpdateProductDTO } from '@modules/products/domain/dto/UpdateProductDTO';
import { DeleteProductDTO } from '@modules/products/domain/dto/DeleteProductDTO';
import { ProductDatasource } from '@modules/products/domain/datasource/ProductDatasource';

/**
 * Implementation of the ProductRepository interface
 * Delegates product operations to the datasource layer
 */
export class ProductRepositoryImp implements ProductRepository {
  /**
   * Creates a new ProductRepositoryImp instance
   * @param productDatasource - The datasource implementation for product operations
   */
  constructor(private readonly productDatasource: ProductDatasource) {}

  /**
   * Retrieves paginated list of products for a user
   * @param userId - User identifier for product retrieval
   * @param limit - Maximum number of products to return
   * @param offset - Number of products to skip for pagination
   * @returns Promise that resolves to paginated products response
   */
  async getProducts(
    userId: string,
    limit?: number,
    offset?: number
  ): Promise<ProductsResponse> {
    return this.productDatasource.getProducts(userId, limit, offset);
  }

  /**
   * Creates a new product for a user
   * @param userId - User identifier for product creation
   * @param productData - Product data to create
   * @returns Promise that resolves to the created product
   */
  async createProduct(
    userId: string,
    productData: CreateProductDTO
  ): Promise<Product> {
    return this.productDatasource.createProduct(userId, productData);
  }

  /**
   * Updates an existing product for a user
   * @param userId - User identifier for product update
   * @param productData - Product data to update
   * @returns Promise that resolves to the updated product
   */
  async updateProduct(
    userId: string,
    productData: UpdateProductDTO
  ): Promise<Product> {
    return this.productDatasource.updateProduct(userId, productData);
  }

  /**
   * Deletes a product for a user
   * @param userId - User identifier for product deletion
   * @param productData - Product data containing deletion information
   * @returns Promise that resolves when deletion is complete
   */
  async deleteProduct(
    userId: string,
    productData: DeleteProductDTO
  ): Promise<void> {
    return this.productDatasource.deleteProduct(userId, productData);
  }
}
