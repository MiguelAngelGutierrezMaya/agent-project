import type { Application } from '@infrastructure/presentation/application';
import { Controller } from '@modules/infrastructure/presentation/controller';
import { DocumentsService } from './service';

/**
 * Controller for handling document-related HTTP requests
 * Routes document requests to the appropriate service methods
 */
export class DocumentsController extends Controller {
  /**
   * Creates a new DocumentsController instance
   * @param app - The application instance
   */
  constructor(public override readonly app: Application) {
    const service = new DocumentsService(app);
    super(app, service);
  }

  /**
   * Handles GET requests for document retrieval
   * @returns Promise that resolves to the HTTP response with documents data
   */
  override async GET(): Promise<Response> {
    return await this.service.executeGET();
  }

  /**
   * Handles POST requests for document creation
   * @returns Promise that resolves to the HTTP response with created document
   */
  override async POST(): Promise<Response> {
    return await this.service.executePOST();
  }

  /**
   * Handles PUT requests for document updates
   * @returns Promise that resolves to the HTTP response with updated document
   */
  override async PUT(): Promise<Response> {
    return await this.service.executePUT();
  }

  /**
   * Handles DELETE requests for document deletion
   * @returns Promise that resolves to the HTTP response confirming deletion
   */
  override async DELETE(): Promise<Response> {
    return await this.service.executeDELETE();
  }
}
