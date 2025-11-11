import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { DatabaseModule } from './shared/persistence/mongo/database.module';
import { ConversationModule } from './modules/conversation/conversation.module';
import { ConfigNotificationModule } from './modules/config/config-notification.module';

/**
 * Root application module.
 *
 * This module configures the main application components including:
 * - Configuration module for environment variables
 * - Database module for MongoDB connections (primary, secondary, and dynamic)
 * - Conversation module for chat functionality
 * - Configuration notification module for SQS consumer
 *
 * @module AppModule
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Makes ConfigModule available globally
      envFilePath: '.env', // Try .env.local first, then .env
      ignoreEnvFile: process.env.NODE_ENV === 'production', // Ignore .env in production
      load: [configuration],
    }),
    DatabaseModule, // MongoDB connections (primary, secondary, dynamic)
    ConversationModule,
    ConfigNotificationModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
