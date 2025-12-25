import { Controller, Get, HttpCode, HttpStatus, Logger } from '@nestjs/common';

/**
 * Health check controller for application monitoring.
 *
 * Provides endpoints to verify that the application is running and responsive.
 * Used by Elastic Beanstalk and other monitoring tools to check application status.
 *
 * @module HealthController
 */
@Controller()
export class HealthController {
  private readonly logger = new Logger(HealthController.name);

  /**
   * Health check endpoint.
   *
   * Returns a simple status response indicating that the application is running.
   * This endpoint should respond quickly without making external calls to databases
   * or services to ensure it remains responsive even when dependencies are down.
   *
   * @returns Object with status and timestamp
   * @example
   * GET /health
   * Response: { "status": "ok", "timestamp": "2025-01-XX..." }
   */
  @Get('health')
  @HttpCode(HttpStatus.OK)
  getHealth(): { status: string; timestamp: string } {
    this.logger.debug('Health check requested', HealthController.name);

    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Root endpoint.
   *
   * Provides a simple response for the root path.
   * Useful for basic connectivity checks and as a fallback health check.
   *
   * @returns Object with status and timestamp
   * @example
   * GET /
   * Response: { "status": "ok", "timestamp": "2025-01-XX..." }
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  getRoot(): { status: string; timestamp: string } {
    this.logger.debug('Root endpoint requested', HealthController.name);

    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}
