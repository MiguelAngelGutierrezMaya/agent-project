import { ProductRepository } from '@modules/products/domain/repositories/ProductRepository';
import {
  Product,
  ProductsResponse,
} from '@modules/products/domain/models/Product';
import { CreateProductDTO } from '@modules/products/domain/dto/CreateProductDTO';
import { UpdateProductDTO } from '@modules/products/domain/dto/UpdateProductDTO';
import { DeleteProductDTO } from '@modules/products/domain/dto/DeleteProductDTO';

/**
 * Use case for retrieving products
 * Orchestrates the product retrieval business logic
 */
export class GetProductsUseCase {
  /**
   * Creates a new GetProductsUseCase instance
   * @param productRepository - The repository for product operations
   */
  constructor(private readonly productRepository: ProductRepository) {}

  /**
   * Executes the product retrieval use case
   * @param userId - User identifier for product retrieval
   * @param limit - Maximum number of products to return
   * @param offset - Number of products to skip for pagination
   * @returns Promise that resolves to paginated products response
   */
  async execute(
    userId: string,
    limit?: number,
    offset?: number
  ): Promise<ProductsResponse> {
    return this.productRepository.getProducts(userId, limit, offset);
  }
}

/**
 * Use case for creating products
 * Orchestrates the product creation business logic
 */
export class CreateProductUseCase {
  /**
   * Creates a new CreateProductUseCase instance
   * @param productRepository - The repository for product operations
   */
  constructor(private readonly productRepository: ProductRepository) {}

  /**
   * Executes the product creation use case
   * @param userId - User identifier for product creation
   * @param productData - Product data to create
   * @returns Promise that resolves to the created product
   */
  async execute(
    userId: string,
    productData: CreateProductDTO
  ): Promise<Product> {
    return this.productRepository.createProduct(userId, productData);
  }
}

/**
 * Use case for updating products
 * Orchestrates the product update business logic
 */
export class UpdateProductUseCase {
  /**
   * Creates a new UpdateProductUseCase instance
   * @param productRepository - The repository for product operations
   */
  constructor(private readonly productRepository: ProductRepository) {}

  /**
   * Executes the product update use case
   * @param userId - User identifier for product update
   * @param productData - Product data to update
   * @returns Promise that resolves to the updated product
   */
  async execute(
    userId: string,
    productData: UpdateProductDTO
  ): Promise<Product> {
    return this.productRepository.updateProduct(userId, productData);
  }
}

/**
 * Use case for deleting products
 * Orchestrates the product deletion business logic
 */
export class DeleteProductUseCase {
  /**
   * Creates a new DeleteProductUseCase instance
   * @param productRepository - The repository for product operations
   */
  constructor(private readonly productRepository: ProductRepository) {}

  /**
   * Executes the product deletion use case
   * @param userId - User identifier for product deletion
   * @param productData - Product data containing deletion information
   * @returns Promise that resolves when deletion is complete
   */
  async execute(userId: string, productData: DeleteProductDTO): Promise<void> {
    return this.productRepository.deleteProduct(userId, productData);
  }
}
