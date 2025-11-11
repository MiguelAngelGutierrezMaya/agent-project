import type { MongooseModuleOptions } from '@nestjs/mongoose';

/**
 * MongoDB configuration interface.
 *
 * This interface defines the structure of MongoDB configuration
 * that can be retrieved from the configuration service.
 *
 * @interface MongoDbConfig
 */
export interface MongoDbConfig {
  /** MongoDB cluster connection URI */
  uri: string;

  /** Public/shared database name (for user mappings and shared data) */
  publicDatabase: string;

  /** Maximum number of connections in the connection pool */
  maxPoolSize: number;

  /** Minimum number of connections in the connection pool */
  minPoolSize: number;

  /** Server selection timeout in milliseconds */
  serverSelectionTimeoutMS: number;

  /** Socket timeout in milliseconds */
  socketTimeoutMS: number;
}

/**
 * Creates Mongoose connection options from MongoDB configuration.
 *
 * @param {MongoDbConfig} config - MongoDB configuration object
 * @returns {MongooseModuleOptions} Mongoose module options
 *
 * @example
 * ```typescript
 * const config = configService.get<MongoDbConfig>('mongodb');
 * const options = createMongooseOptions(config);
 * ```
 */
export function createMongooseOptions(
  config: MongoDbConfig
): MongooseModuleOptions {
  return {
    uri: config.uri,
    dbName: config.publicDatabase,
    maxPoolSize: config.maxPoolSize,
    minPoolSize: config.minPoolSize,
    serverSelectionTimeoutMS: config.serverSelectionTimeoutMS,
    socketTimeoutMS: config.socketTimeoutMS,
  };
}
