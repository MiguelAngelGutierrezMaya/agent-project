import type { ModuleType } from '@modules/infrastructure/presentation/module';

// Weather
import { ROUTES as CONFIG_ROUTES } from '@modules/config/infrastructure/presentation/router';
import { ROUTES as PRODUCTS_ROUTES } from '@modules/products/infrastructure/presentation/router';
import { ROUTES as DOCUMENTS_ROUTES } from '@modules/documents/infrastructure/presentation/router';
import { ROUTES as FILES_ROUTES } from '@modules/files/infrastructure/presentation/router';
import { LoggerService } from '@src/domain/services/Logger';
import { APIGatewayProxyEvent } from 'aws-lambda';

interface ApplicationProps {
  event: APIGatewayProxyEvent;
  logger: LoggerService;
}

export class Application {
  public readonly event: APIGatewayProxyEvent;
  public readonly method: string;
  public readonly modules: Array<ModuleType>;
  public readonly routes: Array<string>;
  public readonly pathname: string;
  public readonly logger: LoggerService;

  /**
   * Constructor for the Application class.
   * @param {APIGatewayProxyEvent} event - The incoming HTTP request
   */
  constructor({ event, logger }: ApplicationProps) {
    this.event = event;
    this.method = event.httpMethod;
    this.pathname = event.path;
    this.modules = [
      ...CONFIG_ROUTES,
      ...PRODUCTS_ROUTES,
      ...DOCUMENTS_ROUTES,
      ...FILES_ROUTES,
    ];
    this.routes = this.modules.map(mod => mod.url);
    this.logger = logger;
  }
}
