import type { ModuleType } from '@modules/infrastructure/presentation/module';

// Embedding
import { ROUTES as EMBEDDING_ROUTES } from '@modules/embedding/infrastructure/presentation/router';
import { LoggerService } from '@src/domain/services/Logger';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { EmbeddingEvent } from '@lib/domain/interfaces/EmbeddingEvent';

type ApplicationEvent = APIGatewayProxyEvent | EmbeddingEvent;

interface ApplicationProps {
  event: ApplicationEvent;
  logger: LoggerService;
}

export class Application {
  public readonly event: ApplicationEvent;
  public readonly method: string;
  public readonly modules: Array<ModuleType>;
  public readonly routes: Array<string>;
  public readonly pathname: string;
  public readonly logger: LoggerService;

  /**
   * Constructor for the Application class.
   * @param {ApplicationEvent} event - The incoming HTTP request
   */
  constructor({ event, logger }: ApplicationProps) {
    this.event = event;
    this.method = event.httpMethod;
    this.pathname = event.path;
    this.modules = [...EMBEDDING_ROUTES];
    this.routes = this.modules.map(mod => mod.url);
    this.logger = logger;
  }
}
