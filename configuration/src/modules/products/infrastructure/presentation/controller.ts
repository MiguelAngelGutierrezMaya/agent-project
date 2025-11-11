import type { Application } from '@infrastructure/presentation/application';
import { Controller } from '@modules/infrastructure/presentation/controller';
import { ProductsService, ProductsCategoriesService } from './service';
import { MethodNotImplementedError } from '@src/infrastructure/shared/utils/errors/methods';

/**
 * Controller for handling product-related HTTP requests
 * Routes product requests to the appropriate service methods
 */
export class ProductsController extends Controller {
  /**
   * Creates a new ProductsController instance
   * @param app - The application instance
   */
  constructor(public override readonly app: Application) {
    const service = new ProductsService(app);
    super(app, service);
  }

  /**
   * Handles GET requests for product retrieval
   * @returns Promise that resolves to the HTTP response with products data
   */
  override async GET(): Promise<Response> {
    return await this.service.executeGET();
  }

  /**
   * Handles POST requests for product creation
   * @returns Promise that resolves to the HTTP response with created product
   */
  override async POST(): Promise<Response> {
    return await this.service.executePOST();
  }

  /**
   * Handles PUT requests for product updates
   * @returns Promise that resolves to the HTTP response with updated product
   */
  override async PUT(): Promise<Response> {
    return await this.service.executePUT();
  }

  /**
   * Handles DELETE requests for product deletion
   * @returns Promise that resolves to the HTTP response confirming deletion
   */
  override async DELETE(): Promise<Response> {
    return await this.service.executeDELETE();
  }
}

/**
 * Controller for handling product category-related HTTP requests
 * Routes product category requests to the appropriate service methods
 */
export class ProductsCategoriesController extends Controller {
  /**
   * Creates a new ProductsCategoriesController instance
   * @param app - The application instance
   */
  constructor(public override readonly app: Application) {
    const service = new ProductsCategoriesService(app);
    super(app, service);
  }

  /**
   * GET method for the ProductsCategoriesController
   * @returns {Promise<Response>} The response from the products categories service
   */
  override async GET(): Promise<Response> {
    return await this.service.executeGET();
  }

  /**
   * POST method for the ProductsCategoriesController
   * @returns {Promise<Response>} The response from the products categories service
   */
  override async POST(): Promise<Response> {
    throw new MethodNotImplementedError();
  }

  /**
   * PUT method for the ProductsCategoriesController
   * @returns {Promise<Response>} The response from the products categories service
   */
  override async PUT(): Promise<Response> {
    throw new MethodNotImplementedError();
  }

  /**
   * DELETE method for the ProductsCategoriesController
   * @returns {Promise<Response>} The response from the products categories service
   */
  override async DELETE(): Promise<Response> {
    throw new MethodNotImplementedError();
  }
}
