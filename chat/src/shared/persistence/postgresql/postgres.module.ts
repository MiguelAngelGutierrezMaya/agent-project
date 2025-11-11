import { Module } from '@nestjs/common';
import { PostgresConnectionService } from './postgres-connection.service';

/**
 * PostgreSQL Module
 *
 * @description
 * Provides PostgreSQL database connection services for the application.
 * Exports PostgresConnectionService for use in other modules.
 */
@Module({
  providers: [PostgresConnectionService],
  exports: [PostgresConnectionService],
})
export class PostgresModule {}
