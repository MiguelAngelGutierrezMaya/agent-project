import type { Application } from '@infrastructure/presentation/application';
import { Controller } from '@modules/infrastructure/presentation/controller';
import { EmbeddingService, EmbeddingStatusService } from './service';
import { MethodNotImplementedError } from '@src/infrastructure/shared/utils/errors/methods';

export class EmbeddingController extends Controller {
  /**
   * Constructor for the EmbeddingController
   * @param {Application} app - The application instance
   */
  constructor(public override readonly app: Application) {
    const service = new EmbeddingService(app);
    super(app, service);
  }

  /**
   * GET method for the EmbeddingController
   * @returns {Promise<Response>} The response from the embedding service
   */
  override async GET(): Promise<Response> {
    throw new MethodNotImplementedError();
  }

  /**
   * POST method for the EmbeddingController
   * @returns {Promise<Response>} The response from the embedding service
   */
  override async POST(): Promise<Response> {
    return await this.service.executePOST();
  }

  /**
   * PUT method for the EmbeddingController
   * @returns {Promise<Response>} The response from the embedding service
   */
  override async PUT(): Promise<Response> {
    throw new MethodNotImplementedError();
  }

  /**
   * DELETE method for the EmbeddingController
   * @returns {Promise<Response>} The response from the embedding service
   */
  override async DELETE(): Promise<Response> {
    throw new MethodNotImplementedError();
  }

  /**
   * EVENT_BRIDGE method for the EmbeddingController
   * @returns {Promise<Response>} The response from the embedding service
   */
  override async EVENT_BRIDGE(): Promise<Response> {
    return await this.service.executeEVENT_BRIDGE();
  }
}

export class EmbeddingStatusController extends Controller {
  /**
   * Constructor for the EmbeddingStatusController
   * @param {Application} app - The application instance
   */
  constructor(public override readonly app: Application) {
    const service = new EmbeddingStatusService(app);
    super(app, service);
  }

  /**
   * GET method for the EmbeddingStatusController
   * @returns {Promise<Response>} The response from the embedding status service
   */
  override async GET(): Promise<Response> {
    throw new MethodNotImplementedError();
  }

  /**
   * POST method for the EmbeddingStatusController
   * @returns {Promise<Response>} The response from the embedding status service
   */
  override async POST(): Promise<Response> {
    return await this.service.executePOST();
  }

  /**
   * PUT method for the EmbeddingStatusController
   * @returns {Promise<Response>} The response from the embedding status service
   */
  override async PUT(): Promise<Response> {
    throw new MethodNotImplementedError();
  }

  /**
   * DELETE method for the EmbeddingStatusController
   * @returns {Promise<Response>} The response from the embedding status service
   */
  override async DELETE(): Promise<Response> {
    throw new MethodNotImplementedError();
  }

  /**
   * EVENT_BRIDGE method for the EmbeddingStatusController
   * @returns {Promise<Response>} The response from the embedding status service
   */
  override async EVENT_BRIDGE(): Promise<Response> {
    return await this.service.executeEVENT_BRIDGE();
  }
}
