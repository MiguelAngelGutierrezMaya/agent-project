import { Pool, PoolClient, PoolConfig } from 'pg';
import { LoggerService } from '@src/domain/services/Logger';

/**
 * PostgreSQL connection service for managing database connections
 * Implements connection pooling and multi-tenant schema switching
 */
export class PostgresConnection {
  private static instance: PostgresConnection;
  private pool: Pool;
  private logger: LoggerService;

  private constructor(logger: LoggerService) {
    this.logger = logger;
    this.initializePool();
  }

  /**
   * Get singleton instance of PostgresConnection
   * @param logger - Logger service instance
   * @returns PostgresConnection instance
   */
  public static getInstance(logger: LoggerService): PostgresConnection {
    if (!PostgresConnection.instance) {
      PostgresConnection.instance = new PostgresConnection(logger);
    }
    return PostgresConnection.instance;
  }

  /**
   * Initialize PostgreSQL connection pool
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
          'Unexpected error on idle client' + err.message,
          PostgresConnection.name
        );
      });

      this.logger.info(
        'PostgreSQL connection pool initialized successfully config: ' +
          JSON.stringify(config),
        PostgresConnection.name
      );
    } catch (error) {
      this.logger.error(
        `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        PostgresConnection.name
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
      this.logger.info(
        'Database client acquired from pool',
        PostgresConnection.name
      );
      return client;
    } catch (error) {
      this.logger.error(
        `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        PostgresConnection.name
      );
      throw error;
    }
  }

  /**
   * Execute a query with automatic client management
   * @param query - SQL query string
   * @param params - Query parameters
   * @returns Promise<any> - Query result
   */
  public async query(query: string, params?: any[]): Promise<any> {
    const client = await this.getClient();
    try {
      const result = await client.query(query, params);
      this.logger.info(
        `Query executed successfully Query: ${query}, Rows: ${result.rowCount}`,
        PostgresConnection.name
      );
      return result;
    } catch (error) {
      this.logger.error(
        `Query execution failed Query: ${query}, Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        PostgresConnection.name
      );
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Execute a transaction with automatic rollback on error
   * @param callback - Transaction callback function
   * @returns Promise<any> - Transaction result
   */
  public async transaction<T>(
    callback: (client: PoolClient) => Promise<T>
  ): Promise<T> {
    const client = await this.getClient();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      this.logger.info(
        'Transaction completed successfully',
        PostgresConnection.name
      );
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      this.logger.error(
        `Transaction rolled back due to error Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        PostgresConnection.name
      );
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Close the connection pool
   */
  public async close(): Promise<void> {
    try {
      await this.pool.end();
      this.logger.info(
        'PostgreSQL connection pool closed successfully',
        PostgresConnection.name
      );
    } catch (error) {
      this.logger.error(
        `Error closing PostgreSQL connection pool Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        PostgresConnection.name
      );
      throw error;
    }
  }
}
