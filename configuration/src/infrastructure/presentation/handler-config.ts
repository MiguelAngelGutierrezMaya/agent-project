import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from 'aws-lambda';
import { addCors } from '@shared/utils/cors';
import { ErrorHandler } from '@shared/utils/errors/handler';
import { Application } from './application';
import { Router } from './router';
import { LoggerServiceImplementation } from '@infrastructure/service/LoggerServiceImp';
import { ResultBodyUndefinedError } from '@shared/utils/errors/result';
import { DomainNameRequiredError } from '@shared/utils/errors/domain';
import { VerifyTokenUseCase } from '@src/application/use-cases/AuthUseCases';
import { ClerkAuthMiddlewareImp } from '@infrastructure/shared/middlewares/clerk/ClerkAuthMiddlewareImp';
import { UnauthorizedError } from '@shared/utils/errors/services';

//
// Factory method to create the handler
// Validate the request
//
async function handler(
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> {
  context.callbackWaitsForEmptyEventLoop = false;

  let response: APIGatewayProxyResult;

  const logger = new LoggerServiceImplementation();

  try {
    logger.info(
      `Starting handler for event: ${JSON.stringify(event)}`,
      handler.name
    );

    if (!event.requestContext.domainName) {
      throw new DomainNameRequiredError();
    }
    const headers = {
      Authorization: event.headers.Authorization || '',
      Accept: event.headers.accept || '',
      'Content-Type': event.headers['content-type'] || '',
    };

    const request = new Request(`https://${event.requestContext.domainName}`, {
      method: event.httpMethod,
      headers,
      body: event.body,
    });

    const authService = new ClerkAuthMiddlewareImp(logger);

    const verifyTokenUseCase = new VerifyTokenUseCase(authService);

    const isAuthenticated = await verifyTokenUseCase.execute(request);

    if (!isAuthenticated) {
      throw new UnauthorizedError();
    }

    const app = new Application({
      event: event,
      logger,
    });

    const router = Router.instantiate(app);

    const result: Response = await router.dispatch();
    const body = await result.json();

    logger.info(
      `Result: ${JSON.stringify(result)}, body: ${body}`,
      handler.name
    );

    if (!body) {
      throw new ResultBodyUndefinedError();
    }

    response = {
      statusCode: result.status,
      body: JSON.stringify(body),
    };
  } catch (error: unknown) {
    response = ErrorHandler.handle(error, logger);
  }

  addCors(response);

  logger.info(`Response: ${JSON.stringify(response)}`, handler.name);

  return response;
}

export { handler };
