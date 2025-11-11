import type { Controller } from '@modules/infrastructure/presentation/controller';
import type { Application } from '@infrastructure/presentation/application';

/**
 * Represents a module in the application, including its URL and controller factory
 * Used for module registration and routing configuration
 */
export interface ModuleType {
  /** URL path for the module */
  url: string;
  /** Factory function that creates a controller instance for the module */
  controller: (app: Application) => Controller;
}
