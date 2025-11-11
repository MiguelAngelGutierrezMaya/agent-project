import { Pool, PoolClient } from 'pg';
import { DatabaseConfig } from '../types/migration';
import { DatabaseConfigFactory, MigrationLogger } from './database';

/**
 * Database connection manager for migrations
 */
export class DatabaseManager {
  private pool: Pool;
  private config: DatabaseConfig;

  constructor(config?: DatabaseConfig) {
    this.config = config || DatabaseConfigFactory.create();
    this.pool = new Pool(this.config);

    // Handle pool errors
    this.pool.on('error', err => {
      MigrationLogger.error('Unexpected error on idle client', err);
    });
  }

  /**
   * Get a client from the pool
   */
  async getClient(): Promise<PoolClient> {
    try {
      const client = await this.pool.connect();
      MigrationLogger.debug('Database client acquired');
      return client;
    } catch (error) {
      MigrationLogger.error('Failed to acquire database client', error);
      throw error;
    }
  }

  /**
   * Execute a query with automatic client management
   */
  async query<T = any>(text: string, params?: any[]): Promise<T[]> {
    const client = await this.getClient();
    try {
      MigrationLogger.debug('Executing query', { text, params });
      const result = await client.query(text, params);
      return result.rows;
    } catch (error) {
      MigrationLogger.error('Query execution failed', { text, error });
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Execute a transaction
   */
  async transaction<T>(
    callback: (client: PoolClient) => Promise<T>
  ): Promise<T> {
    const client = await this.getClient();
    try {
      await client.query('BEGIN');
      MigrationLogger.debug('Transaction started');

      const result = await callback(client);

      await client.query('COMMIT');
      MigrationLogger.debug('Transaction committed');

      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      MigrationLogger.error('Transaction rolled back', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Test database connection
   */
  async testConnection(): Promise<boolean> {
    try {
      const result = await this.query('SELECT NOW()');
      MigrationLogger.info('Database connection test successful');
      return result.length > 0;
    } catch (error) {
      MigrationLogger.error('Database connection test failed', error);
      return false;
    }
  }

  /**
   * Close the connection pool
   */
  async close(): Promise<void> {
    try {
      await this.pool.end();
      MigrationLogger.info('Database connection pool closed');
    } catch (error) {
      MigrationLogger.error('Error closing database connection pool', error);
      throw error;
    }
  }

  /**
   * Get database configuration
   */
  getConfig(): DatabaseConfig {
    return { ...this.config };
  }
}
