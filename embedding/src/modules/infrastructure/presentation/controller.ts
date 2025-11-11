import { MethodNotImplementedError } from '@shared/utils/errors/methods';
import type { Application } from '@infrastructure/presentation/application';
import type { Service } from '@modules/infrastructure/presentation/service';

/**
 * Base controller class providing default HTTP method handlers for modules.
 * Should be extended or wrapped to implement specific logic for each method.
 */
class BaseController {
  constructor(
    public readonly app: Application,
    public readonly service: Service
  ) {}

  async GET(): Promise<Response> {
    throw new MethodNotImplementedError();
  }

  async POST(): Promise<Response> {
    throw new MethodNotImplementedError();
  }

  async PUT(): Promise<Response> {
    throw new MethodNotImplementedError();
  }

  async DELETE(): Promise<Response> {
    throw new MethodNotImplementedError();
  }

  /**
   * Handles proxy EventBridge requests - should be overridden by subclasses
   * @returns Throws MethodNotImplementedError by default
   */
  async EVENT_BRIDGE(): Promise<Response> {
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

const EventBridgeWrapper = (superclass: typeof BaseController) =>
  class extends superclass {
    override async EVENT_BRIDGE(): Promise<Response> {
      return await this.service.executeEVENT_BRIDGE();
    }
  };

/**
 * Main controller class that supports GET and POST methods by delegating to the service.
 * Extends BaseController with wrappers for GET and POST.
 */
export class Controller extends GetWrapper(
  PostWrapper(PutWrapper(DeleteWrapper(EventBridgeWrapper(BaseController))))
) {}
