import { Service } from '@modules/infrastructure/presentation/service';
import { Application } from '@src/infrastructure/presentation/application';
import { HTTP_STATUS_CODES } from '@src/infrastructure/shared/utils/constants';
import { GetProductsDTO } from '@modules/products/domain/dto/GetProductsDTO';
import { CreateProductDTO } from '@modules/products/domain/dto/CreateProductDTO';
import { UpdateProductDTO } from '@modules/products/domain/dto/UpdateProductDTO';
import { DeleteProductDTO } from '@modules/products/domain/dto/DeleteProductDTO';
import { GetProductCategoriesDTO } from '@modules/products/domain/dto/GetProductCategoriesDTO';
import {
  GetProductsUseCase,
  CreateProductUseCase,
  UpdateProductUseCase,
  DeleteProductUseCase,
} from '@modules/products/application/use-cases/ProductUseCase';
import { GetProductCategoriesUseCase } from '@modules/products/application/use-cases/ProductCategoryUseCase';
import { PgProductDatasourceImp } from '@modules/products/infrastructure/datasource/PgProductDatasourceImp';
import { PgProductCategoryDatasourceImp } from '@modules/products/infrastructure/datasource/PgProductCategoryDatasourceImp';
import { ProductRepositoryImp } from '@modules/products/infrastructure/repositories/ProductRepositoryImp';
import { ProductCategoryRepositoryImp } from '@modules/products/infrastructure/repositories/ProductCategoryRepositoryImp';

/**
 * Service for the Products module
 */
export class ProductsService extends Service {
  private productRepository: ProductRepositoryImp;

  /**
   * Constructor for the ProductsService
   * @param {Application} app - The application instance
   */
  constructor(public readonly app: Application) {
    super(app);

    // Implementations
    const productDatasource = new PgProductDatasourceImp(this.app.logger);
    this.productRepository = new ProductRepositoryImp(productDatasource);
  }

  /**
   * Execute GET request for products
   * @returns {Promise<Response>} The response from the products service
   */
  override async executeGET(): Promise<Response> {
    this.app.logger.info(
      'Executing products GET request',
      ProductsService.name
    );

    const [getProductsDTO, error] = GetProductsDTO.create({
      userId: this.app.event.queryStringParameters?.userId || '',
      limit: this.app.event.queryStringParameters?.limit
        ? Number(this.app.event.queryStringParameters.limit)
        : undefined,
      offset: this.app.event.queryStringParameters?.offset
        ? Number(this.app.event.queryStringParameters.offset)
        : undefined,
    });

    if (error) {
      throw error;
    }

    this.app.logger.info('GetProductsDTO', ProductsService.name);

    const getProductsUseCase = new GetProductsUseCase(this.productRepository);
    const productsResponse = await getProductsUseCase.execute(
      getProductsDTO?.userId || '',
      getProductsDTO?.limit,
      getProductsDTO?.offset
    );

    return new Response(
      JSON.stringify({ success: true, data: productsResponse }),
      {
        status: HTTP_STATUS_CODES.SUCCESS,
      }
    );
  }

  /**
   * Execute POST request for creating a product
   * @returns {Promise<Response>} The response from the products service
   */
  override async executePOST(): Promise<Response> {
    this.app.logger.info(
      'Executing products POST request',
      ProductsService.name
    );

    const [createProductDTO, error] = CreateProductDTO.create(
      this.app.event.body ? JSON.parse(this.app.event.body) : {}
    );

    if (error) {
      throw error;
    }

    const createProductUseCase = new CreateProductUseCase(
      this.productRepository
    );
    const product = await createProductUseCase.execute(
      createProductDTO?.userId || '',
      createProductDTO!
    );

    return new Response(JSON.stringify({ success: true, data: product }), {
      status: HTTP_STATUS_CODES.SUCCESS,
    });
  }

  /**
   * Execute PUT request for updating a product
   * @returns {Promise<Response>} The response from the products service
   */
  override async executePUT(): Promise<Response> {
    this.app.logger.info(
      'Executing products PUT request',
      ProductsService.name
    );

    const [updateProductDTO, error] = UpdateProductDTO.create(
      this.app.event.body ? JSON.parse(this.app.event.body) : {}
    );

    if (error) {
      throw error;
    }

    const updateProductUseCase = new UpdateProductUseCase(
      this.productRepository
    );
    const product = await updateProductUseCase.execute(
      updateProductDTO?.userId || '',
      updateProductDTO!
    );

    return new Response(JSON.stringify({ success: true, data: product }), {
      status: HTTP_STATUS_CODES.SUCCESS,
    });
  }

  /**
   * Execute DELETE request for deleting a product
   * @returns {Promise<Response>} The response from the products service
   */
  override async executeDELETE(): Promise<Response> {
    this.app.logger.info(
      'Executing products DELETE request',
      ProductsService.name
    );

    const [deleteProductDTO, error] = DeleteProductDTO.create(
      this.app.event.body ? JSON.parse(this.app.event.body) : {}
    );

    if (error) {
      throw error;
    }

    const deleteProductUseCase = new DeleteProductUseCase(
      this.productRepository
    );
    await deleteProductUseCase.execute(
      deleteProductDTO?.userId || '',
      deleteProductDTO!
    );

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Product deleted successfully',
      }),
      {
        status: HTTP_STATUS_CODES.SUCCESS,
      }
    );
  }
}

export class ProductsCategoriesService extends Service {
  private productCategoryRepository: ProductCategoryRepositoryImp;

  /**
   * Constructor for the ProductsCategoriesService
   * @param {Application} app - The application instance
   */
  constructor(public readonly app: Application) {
    super(app);

    // Implementations
    const productCategoryDatasource = new PgProductCategoryDatasourceImp(
      this.app.logger
    );
    this.productCategoryRepository = new ProductCategoryRepositoryImp(
      productCategoryDatasource
    );
  }

  /**
   * Execute GET request for products categories
   * @returns {Promise<Response>} The response from the products categories service
   */
  override async executeGET(): Promise<Response> {
    this.app.logger.info(
      'Executing product categories GET request',
      ProductsCategoriesService.name
    );

    const [getProductCategoriesDTO, error] = GetProductCategoriesDTO.create({
      userId: this.app.event.queryStringParameters?.userId || '',
      limit: this.app.event.queryStringParameters?.limit
        ? Number(this.app.event.queryStringParameters.limit)
        : undefined,
      offset: this.app.event.queryStringParameters?.offset
        ? Number(this.app.event.queryStringParameters.offset)
        : undefined,
    });

    if (error) {
      throw error;
    }

    this.app.logger.info(
      'GetProductCategoriesDTO',
      ProductsCategoriesService.name
    );

    const getProductCategoriesUseCase = new GetProductCategoriesUseCase(
      this.productCategoryRepository
    );
    const categoriesResponse = await getProductCategoriesUseCase.execute(
      getProductCategoriesDTO?.userId || '',
      getProductCategoriesDTO?.limit,
      getProductCategoriesDTO?.offset
    );

    return new Response(
      JSON.stringify({ success: true, data: categoriesResponse }),
      {
        status: HTTP_STATUS_CODES.SUCCESS,
      }
    );
  }
}
