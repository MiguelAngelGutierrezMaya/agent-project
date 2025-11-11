import { MethodNotImplementedError } from '@shared/utils/errors/methods';
import type { Application } from '@infrastructure/presentation/application';
import type { Service } from '@modules/infrastructure/presentation/service';

/**
 * Base controller class providing default HTTP method handlers for modules
 * Should be extended or wrapped to implement specific routing logic for each method
 */
class BaseController {
  /**
   * Creates a new BaseController instance
   * @param app - The application instance containing request context
   * @param service - The service instance for handling business logic
   */
  constructor(
    public readonly app: Application,
    public readonly service: Service
  ) {}

  /**
   * Handles GET requests - should be overridden by subclasses
   * @returns Throws MethodNotImplementedError by default
   */
  async GET(): Promise<Response> {
    throw new MethodNotImplementedError();
  }

  /**
   * Handles POST requests - should be overridden by subclasses
   * @returns Throws MethodNotImplementedError by default
   */
  async POST(): Promise<Response> {
    throw new MethodNotImplementedError();
  }

  /**
   * Handles PUT requests - should be overridden by subclasses
   * @returns Throws MethodNotImplementedError by default
   */
  async PUT(): Promise<Response> {
    throw new MethodNotImplementedError();
  }

  /**
   * Handles DELETE requests - should be overridden by subclasses
   * @returns Throws MethodNotImplementedError by default
   */
  async DELETE(): Promise<Response> {
    throw new MethodNotImplementedError();
  }
}

const GetWrapper = (superclass: typeof BaseController) =>
  class extends superclass {
    override async GET(): Promise<Response> {
      return await this.service.executeGET();
    }
  };

const PostWrapper = (superclass: typeof BaseController) =>
  class extends superclass {
    override async POST(): Promise<Response> {
      return await this.service.executePOST();
    }
  };

const PutWrapper = (superclass: typeof BaseController) =>
  class extends superclass {
    override async PUT(): Promise<Response> {
      return await this.service.executePUT();
    }
  };

const DeleteWrapper = (superclass: typeof BaseController) =>
  class extends superclass {
    override async DELETE(): Promise<Response> {
      return await this.service.executeDELETE();
    }
  };

/**
 * Main controller class that delegates all HTTP methods to the service layer
 * Extends BaseController with wrapper mixins for all HTTP methods
 * Used as the base class for all module controllers
 */
export class Controller extends GetWrapper(
  PostWrapper(PutWrapper(DeleteWrapper(BaseController)))
) {}
