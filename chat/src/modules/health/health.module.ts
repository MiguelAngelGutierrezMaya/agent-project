import { Module } from '@nestjs/common';
import { HealthController } from './controllers/health.controller';

/**
 * Health Module
 *
 * @description
 * Provides health check endpoints for application monitoring and load balancer health checks.
 * This module is used by Elastic Beanstalk and other monitoring tools to verify that the
 * application is running and responsive.
 *
 * @module HealthModule
 */
@Module({
  controllers: [HealthController],
  providers: [],
  exports: [],
})
export class HealthModule {}
