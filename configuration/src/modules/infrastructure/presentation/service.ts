import type { Application } from '@infrastructure/presentation/application';
import { ServiceNotImplementedError } from '@shared/utils/errors/services';

/**
 * Base service class for agents, providing default HTTP method handlers
 * Should be extended to implement specific business logic for each method
 */
class BaseService {
  /**
   * Creates a new BaseService instance
   * @param application - The application instance containing request context
   */
  constructor(public readonly application: Application) {}

  /**
   * Handles GET requests - should be overridden by subclasses
   * @returns Throws ServiceNotImplementedError by default
   */
  async executeGET(): Promise<Response> {
    throw new ServiceNotImplementedError();
  }

  /**
   * Handles POST requests - should be overridden by subclasses
   * @returns Throws ServiceNotImplementedError by default
   */
  async executePOST(): Promise<Response> {
    throw new ServiceNotImplementedError();
  }

  /**
   * Handles PUT requests - should be overridden by subclasses
   * @returns Throws ServiceNotImplementedError by default
   */
  async executePUT(): Promise<Response> {
    throw new ServiceNotImplementedError();
  }

  /**
   * Handles DELETE requests - should be overridden by subclasses
   * @returns Throws ServiceNotImplementedError by default
   */
  async executeDELETE(): Promise<Response> {
    throw new ServiceNotImplementedError();
  }
}

/**
 * Wrapper mixin that overrides the executeGET method to delegate to service
 * Used to extend BaseService with GET method delegation
 */
const ExecuteGETWrapper = (superclass: typeof BaseService) =>
  class extends superclass {
    override async executeGET(): Promise<Response> {
      return new Response('Not implemented');
    }
  };

const ExecutePOSTWrapper = (superclass: typeof BaseService) =>
  class extends superclass {
    override async executePOST(): Promise<Response> {
      return new Response('Not implemented');
    }
  };

const ExecutePUTWrapper = (superclass: typeof BaseService) =>
  class extends superclass {
    override async executePUT(): Promise<Response> {
      return new Response('Not implemented');
    }
  };

const ExecuteDELETEWrapper = (superclass: typeof BaseService) =>
  class extends superclass {
    override async executeDELETE(): Promise<Response> {
      return new Response('Not implemented');
    }
  };

/**
 * Main service class that provides default HTTP method implementations
 * Extends BaseService with wrapper mixins for all HTTP methods
 * Used as the base class for all module services
 */
export class Service extends ExecuteGETWrapper(
  ExecutePOSTWrapper(ExecutePUTWrapper(ExecuteDELETEWrapper(BaseService)))
) {}
