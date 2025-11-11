import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigNotificationConsumer } from './config-notification.consumer';
import { ConfigPersistenceService } from './config-persistence.service';
import { DatabaseModule } from '@shared/persistence/mongo/database.module';
import {
  ClientConfig,
  ClientConfigSchema,
} from '@shared/persistence/mongo/schemas/client-config.schema';

/**
 * Module for handling configuration notifications from SQS
 *
 * @description This module configures the SQS consumer that listens for
 * configuration change notifications and processes them accordingly.
 *
 * It includes:
 * - SQS consumer for configuration notifications
 * - Persistence service for storing configurations in MongoDB
 * - Access to both public and tenant databases
 *
 * @module ConfigNotificationModule
 */
@Module({
  imports: [
    DatabaseModule, // Provides DatabaseConnectionService
    MongooseModule.forFeature([
      { name: ClientConfig.name, schema: ClientConfigSchema },
    ]),
  ],
  providers: [ConfigNotificationConsumer, ConfigPersistenceService],
  exports: [ConfigNotificationConsumer, ConfigPersistenceService],
})
export class ConfigNotificationModule {}
