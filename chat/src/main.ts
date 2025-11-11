import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { ConfigurationError } from './shared/utils/errors/modules';

/**
 * Logger instance for the bootstrap process.
 * Used to log application startup and error events.
 */
const logger = new Logger('Bootstrap');

/**
 * Initializes and starts the NestJS application.
 *
 * This function:
 * 1. Creates a new NestJS application instance using the AppModule
 * 2. Gets the port from the configuration service
 * 3. Starts the server on the specified port
 * 4. Logs the successful startup with the port number
 *
 * @returns Promise<void> Resolves when the server is successfully started
 * @throws Error if the application fails to start
 */
async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  // Get ConfigService to access configuration
  const configService = app.get(ConfigService);

  // Get port from configuration (from your configuration.ts file)
  const port = configService.get<number>('port');

  if (!port) {
    throw new ConfigurationError('Port is not defined');
  }

  await app.listen(port);

  logger.log(`Server is running on port ${port}`);
}

/**
 * Application entry point.
 *
 * Starts the NestJS application and handles any startup errors.
 * If the application fails to start, the error is logged and the process exits.
 */
bootstrap().catch(error => {
  logger.error('Error starting server', error);
});
