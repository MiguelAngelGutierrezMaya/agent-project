import type { Application } from '@infrastructure/presentation/application';
import { Controller } from '@modules/infrastructure/presentation/controller';
import { ConfigService } from './service';
import { MethodNotImplementedError } from '@src/infrastructure/shared/utils/errors/methods';

/**
 * Controller for handling configuration-related HTTP requests
 * Routes configuration requests to the appropriate service methods
 */
export class ConfigController extends Controller {
  /**
   * Creates a new ConfigController instance
   * @param app - The application instance
   */
  constructor(public override readonly app: Application) {
    const service = new ConfigService(app);
    super(app, service);
  }

  /**
   * Handles GET requests for configuration retrieval
   * @returns Promise that resolves to the HTTP response with configuration data
   */
  override async GET(): Promise<Response> {
    return await this.service.executeGET();
  }

  /**
   * POST method is not implemented for configuration
   * @returns Throws MethodNotImplementedError
   */
  override async POST(): Promise<Response> {
    throw new MethodNotImplementedError();
  }

  /**
   * Handles PUT requests for configuration updates
   * @returns Promise that resolves to the HTTP response with updated configuration
   */
  override async PUT(): Promise<Response> {
    return await this.service.executePUT();
  }

  /**
   * DELETE method is not implemented for configuration
   * @returns Throws MethodNotImplementedError
   */
  override async DELETE(): Promise<Response> {
    throw new MethodNotImplementedError();
  }
}
