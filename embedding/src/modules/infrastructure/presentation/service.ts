import type { Application } from '@infrastructure/presentation/application';
import { ServiceNotImplementedError } from '@shared/utils/errors/services';

/**
 * Base service class for agents, providing a default execute method.
 * Should be extended to implement specific logic.
 */
class BaseService {
  constructor(public readonly application: Application) {}

  async executeGET(): Promise<Response> {
    throw new ServiceNotImplementedError();
  }

  async executePOST(): Promise<Response> {
    throw new ServiceNotImplementedError();
  }

  async executePUT(): Promise<Response> {
    throw new ServiceNotImplementedError();
  }

  async executeDELETE(): Promise<Response> {
    throw new ServiceNotImplementedError();
  }

  /**
   * Handles proxy EventBridge requests - should be overridden by subclasses
   * @returns Throws ServiceNotImplementedError by default
   */
  async executeEVENT_BRIDGE(): Promise<Response> {
    throw new ServiceNotImplementedError();
  }
}

/**
 * Wrapper mixin that overrides the execute method to provide a default response.
 * Used to extend BaseService with a not implemented response.
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

const ExecuteEVENT_BRIDGEWrapper = (superclass: typeof BaseService) =>
  class extends superclass {
    override async executeEVENT_BRIDGE(): Promise<Response> {
      return new Response('Not implemented');
    }
  };

/**
 * Main agent service class, extending BaseService with ExecuteWrapper.
 * Used as the default service for modules.
 */
export class Service extends ExecuteGETWrapper(
  ExecutePOSTWrapper(
    ExecutePUTWrapper(
      ExecuteDELETEWrapper(ExecuteEVENT_BRIDGEWrapper(BaseService))
    )
  )
) {}
