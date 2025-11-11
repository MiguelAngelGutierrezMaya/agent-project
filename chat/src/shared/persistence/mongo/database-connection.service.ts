import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectConnection } from '@nestjs/mongoose';
import type { Connection } from 'mongoose';

/**
 * Service for managing MongoDB database connections.
 *
 * This service provides methods to:
 * - Access the base connection to MongoDB cluster
 * - Get the public database connection
 * - Create dynamic connections to client databases
 * - Validate database connectivity on module initialization
 *
 * ## Multi-Tenant Architecture
 *
 * The service supports a multi-tenant architecture where:
 * - One public database stores user mappings and shared data
 * - Each client has their own database in the same cluster
 * - Databases are accessed dynamically using `connection.useDb()`
 *
 * @class DatabaseConnectionService
 * @implements {OnModuleInit}
 *
 * @example
 * ```typescript
 * @Injectable()
 * export class MessagesService {
 *   constructor(
 *     private readonly dbService: DatabaseConnectionService,
 *   ) {}
 *
 *   // Access public database (default)
 *   async getPublicData() {
 *     const db = this.dbService.getPublicDatabase();
 *     const users = db.collection('users');
 *     return users.find().toArray();
 *   }
 *
 *   // Access client-specific database
 *   async getClientMessages(clientId: string) {
 *     const db = this.dbService.getDatabase(`client_${clientId}`);
 *     const messages = db.collection('messages');
 *     return messages.find().toArray();
 *   }
 * }
 * ```
 */
@Injectable()
export class DatabaseConnectionService implements OnModuleInit {
  private readonly logger = new Logger(DatabaseConnectionService.name);
  private readonly publicDatabaseName: string;
  private readonly databaseCache = new Map<string, Connection>();

  /**
   * Creates an instance of DatabaseConnectionService.
   *
   * @param {Connection} connection - Base MongoDB connection (injected)
   * @param {ConfigService} configService - Configuration service for accessing env variables
   */
  constructor(
    @InjectConnection()
    private readonly connection: Connection,
    private readonly configService: ConfigService
  ) {
    this.publicDatabaseName =
      this.configService.get<string>('mongodb.publicDatabase') ?? 'chat_public';
  }

  /**
   * Lifecycle hook that runs when the module is initialized.
   * Validates the connection on startup.
   *
   * @returns {void}
   */
  onModuleInit(): void {
    this.validateConnection();
  }

  /**
   * Gets the base MongoDB connection to the cluster.
   *
   * @returns {Connection} Base MongoDB connection
   *
   * @example
   * ```typescript
   * const connection = this.dbService.getConnection();
   * const admin = connection.db.admin();
   * const databases = await admin.listDatabases();
   * ```
   */
  getConnection(): Connection {
    return this.connection;
  }

  /**
   * Gets the public/shared database connection.
   * This database contains user mappings and shared information.
   *
   * @returns {Connection} Public database connection
   *
   * @example
   * ```typescript
   * const publicDb = this.dbService.getPublicDatabase();
   * const users = publicDb.collection('users');
   * const user = await users.findOne({ email: 'user@example.com' });
   * ```
   */
  getPublicDatabase(): Connection {
    return this.connection;
  }

  /**
   * Gets or creates a connection to a specific database in the cluster.
   * Connections are cached for reuse to improve performance.
   *
   * This is useful for multi-tenant scenarios where each client has their own database.
   *
   * @param {string} databaseName - Name of the database to connect to
   * @returns {Connection} MongoDB connection to the specified database
   *
   * @example
   * ```typescript
   * // Access a client's database
   * const clientDb = this.dbService.getDatabase('client_abc123');
   * const messages = clientDb.collection('messages');
   * const userMessages = await messages.find({ userId: 'user123' }).toArray();
   * ```
   */
  getDatabase(databaseName: string): Connection {
    /* Check if connection is already cached */
    if (this.databaseCache.has(databaseName)) {
      return this.databaseCache.get(databaseName)!;
    }

    this.logger.log(`Creating connection to database: ${databaseName}`);

    /* Use the base connection to switch to a different database */
    const dbConnection = this.connection.useDb(databaseName, {
      useCache: true,
    });

    /* Cache the connection for reuse */
    this.databaseCache.set(databaseName, dbConnection);

    return dbConnection;
  }

  /**
   * Gets the current state of a connection.
   *
   * @param {Connection} connection - MongoDB connection to check
   * @returns {string} Connection state (connecting, connected, disconnecting, disconnected)
   *
   * @example
   * ```typescript
   * const connection = this.dbService.getConnection();
   * const state = this.dbService.getConnectionState(connection);
   * console.log(`Connection state: ${state}`); // "connected"
   * ```
   */
  getConnectionState(connection: Connection): string {
    const states: Record<number, string> = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting',
    };
    return states[connection.readyState] || 'unknown';
  }

  /**
   * Gets statistics about cached database connections.
   *
   * @returns {object} Connection statistics
   *
   * @example
   * ```typescript
   * const stats = this.dbService.getConnectionStats();
   * console.log(`Total cached databases: ${stats.totalCached}`);
   * console.log(`Databases: ${stats.databases.join(', ')}`);
   * ```
   */
  getConnectionStats(): {
    publicDatabase: string;
    totalCached: number;
    databases: string[];
    connectionState: string;
  } {
    return {
      publicDatabase: this.publicDatabaseName,
      totalCached: this.databaseCache.size,
      databases: Array.from(this.databaseCache.keys()),
      connectionState: this.getConnectionState(this.connection),
    };
  }

  /**
   * Lists all databases in the MongoDB cluster.
   * Requires appropriate permissions.
   *
   * @async
   * @returns {Promise<string[]>} Array of database names
   *
   * @example
   * ```typescript
   * const databases = await this.dbService.listDatabases();
   * console.log('Available databases:', databases);
   * ```
   */
  async listDatabases(): Promise<string[]> {
    try {
      if (!this.connection.db) {
        throw new Error('Database connection not initialized');
      }
      const admin = this.connection.db.admin();
      const result = await admin.listDatabases();
      return result.databases.map((db: { name: string }) => db.name);
    } catch (error) {
      this.logger.error('Failed to list databases', error);
      throw error;
    }
  }

  /**
   * Creates a new database by inserting a document.
   * MongoDB creates databases automatically on first write.
   *
   * @async
   * @param {string} databaseName - Name of the database to create
   * @param {string} collectionName - Name of the initial collection
   * @returns {Promise<Connection>} Connection to the new database
   *
   * @example
   * ```typescript
   * // Create a new client database with an initial collection
   * const clientDb = await this.dbService.createDatabase(
   *   'client_abc123',
   *   'conversations'
   * );
   * ```
   */
  async createDatabase(
    databaseName: string,
    collectionName: string = '_init'
  ): Promise<Connection> {
    const db = this.getDatabase(databaseName);

    /* Create initial collection by inserting a document */
    const collection = db.collection(collectionName);
    await collection.insertOne({ _createdAt: new Date() });

    this.logger.log(`Created database: ${databaseName}`);

    return db;
  }

  /**
   * Clears the database connection cache.
   * Useful for cleanup during shutdown or testing.
   *
   * @returns {void}
   *
   * @example
   * ```typescript
   * async onModuleDestroy() {
   *   this.dbService.clearCache();
   * }
   * ```
   */
  clearCache(): void {
    this.logger.log('Clearing database connection cache');
    this.databaseCache.clear();
  }

  /**
   * Validates the base connection to MongoDB.
   *
   * @private
   * @returns {void}
   */
  private validateConnection(): void {
    try {
      /* eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison */
      if (this.connection.readyState === 1) {
        this.logger.log(
          `✅ Connected to MongoDB cluster - Public database: ${this.publicDatabaseName}`
        );
      } else {
        this.logger.warn(
          `⚠️ MongoDB connection state: ${this.getConnectionState(this.connection)}`
        );
      }
    } catch (error) {
      this.logger.error('Error validating database connection', error);
      throw error;
    }
  }
}
