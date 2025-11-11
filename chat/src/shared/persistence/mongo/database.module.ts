import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { DatabaseConnectionService } from './database-connection.service';
import {
  ClientConfig,
  ClientConfigSchema,
} from './schemas/client-config.schema';

/**
 * Database module that configures MongoDB connection.
 *
 * This module provides:
 * - Single connection to MongoDB cluster
 * - Access to public/shared database
 * - Dynamic access to any database in the cluster (multi-tenant support)
 *
 * ## Architecture
 *
 * The system uses a single connection to a MongoDB cluster with multiple databases:
 * - **Public Database**: Contains user mappings and shared information
 * - **Client Databases**: One database per client/tenant (created dynamically)
 *
 * ## Usage
 *
 * ### In a module (using public database):
 * ```typescript
 * import { Module } from '@nestjs/common';
 * import { MongooseModule } from '@nestjs/mongoose';
 * import { UserSchema } from './schemas/user.schema';
 *
 * @Module({
 *   imports: [
 *     MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
 *   ],
 * })
 * export class UsersModule {}
 * ```
 *
 * ### In a service (accessing client databases):
 * ```typescript
 * import { Injectable } from '@nestjs/common';
 * import { DatabaseConnectionService } from '@/shared/persistence/mongo/database-connection.service';
 *
 * @Injectable()
 * export class ClientDataService {
 *   constructor(
 *     private readonly dbService: DatabaseConnectionService,
 *   ) {}
 *
 *   async getClientMessages(clientId: string) {
 *     const db = this.dbService.getDatabase(`client_${clientId}`);
 *     const messages = db.collection('messages');
 *     return messages.find().toArray();
 *   }
 * }
 * ```
 *
 * @module DatabaseModule
 */
@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const uri = configService.get<string>('mongodb.uri') ?? '';
        const dbName =
          configService.get<string>('mongodb.publicDatabase') ?? '';
        const maxPoolSize =
          configService.get<number>('mongodb.maxPoolSize') ?? 10;
        const minPoolSize =
          configService.get<number>('mongodb.minPoolSize') ?? 2;
        const serverSelectionTimeoutMS =
          configService.get<number>('mongodb.serverSelectionTimeoutMS') ?? 5000;
        const socketTimeoutMS =
          configService.get<number>('mongodb.socketTimeoutMS') ?? 45000;

        return {
          uri,
          dbName,
          maxPoolSize,
          minPoolSize,
          serverSelectionTimeoutMS,
          socketTimeoutMS,
        };
      },
      inject: [ConfigService],
    }),
    /* Register global models for the public database */
    MongooseModule.forFeature([
      { name: ClientConfig.name, schema: ClientConfigSchema },
    ]),
  ],
  providers: [DatabaseConnectionService],
  exports: [MongooseModule, DatabaseConnectionService],
})
export class DatabaseModule {}
