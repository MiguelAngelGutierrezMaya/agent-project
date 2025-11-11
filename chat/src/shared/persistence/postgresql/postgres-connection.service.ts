import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { Pool, PoolClient, PoolConfig, QueryResult } from 'pg';

/**
 * PostgreSQL connection service for managing database connections
 * Implements connection pooling and multi-tenant schema switching
 *
 * @description
 * NestJS service that provides PostgreSQL connection management.
 * Uses singleton pattern with connection pooling for optimal performance.
 * Supports multi-tenant schema switching for isolated data access.
 */
@Injectable()
export class PostgresConnectionService implements OnModuleDestroy {
  private readonly logger = new Logger(PostgresConnectionService.name);
  private pool: Pool;

  constructor() {
    this.initializePool();
  }

  /**
   * Initialize PostgreSQL connection pool
   * @private
   */
  private initializePool(): void {
    try {
      const config: PoolConfig = {
        host: process.env.DATABASE_HOST,
        port: parseInt(process.env.DATABASE_PORT || '5432'),
        database: process.env.DATABASE_NAME,
        user: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASSWORD,
        ssl: {
          rejectUnauthorized: false,
          checkServerIdentity: () => undefined,
        },
        max: 20, // Maximum number of clients in the pool
        idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
        connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
        maxUses: 7500, // Close (and replace) a connection after it has been used 7500 times
      };

      this.pool = new Pool(config);

      // Handle pool errors
      this.pool.on('error', (err: Error) => {
        this.logger.error(
          `Unexpected error on idle client: ${err.message}`,
          PostgresConnectionService.name
        );
      });

      this.logger.log(
        `PostgreSQL connection pool initialized successfully`,
        PostgresConnectionService.name
      );
    } catch (error: unknown) {
      this.logger.error(
        `Error initializing PostgreSQL connection pool: ${error instanceof Error ? error.message : 'Unknown error'}`,
        PostgresConnectionService.name
      );
      throw error;
    }
  }

  /**
   * Get a client from the connection pool
   * @returns Promise<PoolClient>
   */
  public async getClient(): Promise<PoolClient> {
    try {
      const client = await this.pool.connect();
      this.logger.debug(
        'Database client acquired from pool',
        PostgresConnectionService.name
      );
      return client;
    } catch (error: unknown) {
      this.logger.error(
        `Error acquiring database client: ${error instanceof Error ? error.message : 'Unknown error'}`,
        PostgresConnectionService.name
      );
      throw error;
    }
  }

  /**
   * Execute a query with automatic client management
   * @param query - SQL query string
   * @param params - Query parameters
   * @returns Promise<QueryResult> - Query result
   */
  public async query(query: string, params?: any[]): Promise<QueryResult> {
    const client = await this.getClient();
    try {
      const result = await client.query(query, params);
      this.logger.debug(
        `Query executed successfully. Rows affected: ${result.rowCount}`,
        PostgresConnectionService.name
      );
      return result;
    } catch (error: unknown) {
      this.logger.error(
        `Query execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        PostgresConnectionService.name
      );
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Execute a transaction with automatic rollback on error
   * @param callback - Transaction callback function
   * @returns Promise<T> - Transaction result
   */
  public async transaction<T>(
    callback: (client: PoolClient) => Promise<T>
  ): Promise<T> {
    const client = await this.getClient();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      this.logger.debug(
        'Transaction completed successfully',
        PostgresConnectionService.name
      );
      return result;
    } catch (error: unknown) {
      await client.query('ROLLBACK');
      this.logger.error(
        `Transaction rolled back due to error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        PostgresConnectionService.name
      );
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get the schema query for setting schema context
   * @param schema - Database schema name
   * @returns string - Schema query
   * @description This query is used to set the schema context directly
   * by setting the search_path to the specified schema for multi-tenant support
   */
  public getSchemaQuery(schema: string): string {
    const escapedSchema = schema.replace(/'/g, "''");

    return `
      DO $$
      DECLARE
          user_schema VARCHAR(100);
      BEGIN
          user_schema := '${escapedSchema}';

          EXECUTE format('SET search_path TO %I, public', user_schema);
          
          RAISE NOTICE 'Search path set to: %', user_schema;
      END $$;
    `;
  }

  /**
   * Cleanup resources when module is destroyed
   */
  async onModuleDestroy(): Promise<void> {
    try {
      await this.pool.end();
      this.logger.log(
        'PostgreSQL connection pool closed successfully',
        PostgresConnectionService.name
      );
    } catch (error: unknown) {
      this.logger.error(
        `Error closing PostgreSQL connection pool: ${error instanceof Error ? error.message : 'Unknown error'}`,
        PostgresConnectionService.name
      );
      throw error;
    }
  }
}
