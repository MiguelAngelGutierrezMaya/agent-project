import type { Application } from '@infrastructure/presentation/application';
import { Controller } from '@modules/infrastructure/presentation/controller';
import { FilesService } from './service';
import { MethodNotImplementedError } from '@src/infrastructure/shared/utils/errors/methods';

export class FilesController extends Controller {
  /**
   * Constructor for the FilesController
   * @param {Application} app - The application instance
   */
  constructor(public override readonly app: Application) {
    const service = new FilesService(app);
    super(app, service);
  }

  /**
   * GET method for the FilesController
   * @returns {Promise<Response>} The response from the weather service
   */
  override async GET(): Promise<Response> {
    return await this.service.executeGET();
  }

  /**
   * POST method for the FilesController
   * @returns {Promise<Response>} The response from the weather service
   */
  override async POST(): Promise<Response> {
    return await this.service.executePOST();
  }

  /**
   * PUT method for the FilesController
   * @returns {Promise<Response>} The response from the weather service
   */
  override async PUT(): Promise<Response> {
    throw new MethodNotImplementedError();
  }

  /**
   * DELETE method for the FilesController
   * @returns {Promise<Response>} The response from the weather service
   */
  override async DELETE(): Promise<Response> {
    throw new MethodNotImplementedError();
  }
}
