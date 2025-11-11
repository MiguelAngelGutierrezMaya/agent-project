import { MongoClient, Db } from 'mongodb';
import type { DatabaseConnection, MigrationConfig } from '../types';

/**
 * Database connection service for MongoDB migrations.
 *
 * This service handles connections to both public and tenant databases
 * for multi-tenant migration operations.
 */
export class DatabaseConnectionService implements DatabaseConnection {
  private client!: MongoClient;
  private publicDb!: Db;
  private config: MigrationConfig;

  constructor(config: MigrationConfig) {
    this.config = config;
  }

  /**
   * Initialize database connection.
   */
  async connect(): Promise<void> {
    try {
      this.client = new MongoClient(this.config.uri, {
        maxPoolSize: this.config.maxPoolSize,
        minPoolSize: this.config.minPoolSize,
        serverSelectionTimeoutMS: this.config.serverSelectionTimeoutMS,
        socketTimeoutMS: this.config.socketTimeoutMS,
      });

      await this.client.connect();
      this.publicDb = this.client.db(this.config.publicDatabase);

      console.log('✅ Connected to MongoDB successfully');
      console.log(`📊 Public database: ${this.config.publicDatabase}`);
    } catch (error) {
      console.error('❌ Failed to connect to MongoDB:', error);
      throw error;
    }
  }

  /**
   * Get the public database instance.
   */
  get publicDatabase(): Db {
    if (!this.publicDb) {
      throw new Error('Database not connected. Call connect() first.');
    }
    return this.publicDb;
  }

  /**
   * Get a tenant database by schema name.
   */
  getTenantDatabase(schemaName: string): Db {
    if (!this.client) {
      throw new Error('Database not connected. Call connect() first.');
    }
    return this.client.db(schemaName);
  }

  /**
   * List all tenant databases.
   * Filters out ignored databases and the public database.
   */
  async listTenantDatabases(): Promise<string[]> {
    if (!this.client) {
      throw new Error('Database not connected. Call connect() first.');
    }

    try {
      const adminDb = this.client.db('admin');
      const result = await adminDb.admin().listDatabases();

      const tenantDatabases = result.databases
        .map((db: { name: string }) => db.name)
        .filter((name: string) => {
          // Exclude ignored databases (from config)
          if (this.config.ignoreDatabases.includes(name)) {
            return false;
          }
          // Exclude public database
          if (name === this.config.publicDatabase) {
            return false;
          }
          // Include all others (tenant databases)
          return true;
        });

      console.log(`📁 Found ${tenantDatabases.length} tenant databases`);
      if (tenantDatabases.length > 0) {
        console.log(
          `   Ignored databases: ${this.config.ignoreDatabases.join(', ')}`
        );
        console.log(`   Tenant databases: ${tenantDatabases.join(', ')}`);
      }
      return tenantDatabases;
    } catch (error) {
      console.error('❌ Failed to list tenant databases:', error);
      throw error;
    }
  }

  /**
   * Close database connection.
   */
  async close(): Promise<void> {
    if (this.client) {
      await this.client.close();
      console.log('🔌 Database connection closed');
    }
  }

  /**
   * Get MongoDB client instance.
   */
  get clientInstance(): MongoClient {
    if (!this.client) {
      throw new Error('Database not connected. Call connect() first.');
    }
    return this.client;
  }
}
