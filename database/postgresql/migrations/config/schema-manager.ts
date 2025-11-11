import { PoolClient } from 'pg';
import { DatabaseManager } from './connection';
import { MigrationLogger } from './database';

/**
 * Schema information interface
 */
export interface SchemaInfo {
  schema_name: string;
  schema_owner: string;
}

/**
 * Service for managing multiple database schemas
 */
export class SchemaManager {
  private dbManager: DatabaseManager;

  constructor(dbManager: DatabaseManager) {
    this.dbManager = dbManager;
  }

  /**
   * Get active company schemas from the companies table
   */
  async getActiveCompanySchemas(): Promise<string[]> {
    const client = await this.dbManager.getClient();
    try {
      const query = `
        SELECT schema_name 
        FROM companies 
        WHERE status = 'active' 
          AND deleted_at IS NULL
        ORDER BY schema_name;
      `;

      const result = await client.query(query);
      const schemas = result.rows.map(row => row.schema_name);

      MigrationLogger.info(
        `Found ${schemas.length} active company schemas: ${schemas.join(', ')}`
      );
      return schemas;
    } catch (error) {
      MigrationLogger.error('Failed to get active company schemas', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get schemas to process from companies table
   */
  async getSchemasToProcess(): Promise<string[]> {
    const companySchemas = await this.getActiveCompanySchemas();
    MigrationLogger.info(`Using company schemas: ${companySchemas.join(', ')}`);
    return companySchemas;
  }

  /**
   * Check if a table exists in a specific schema
   */
  async tableExists(schemaName: string, tableName: string): Promise<boolean> {
    const client = await this.dbManager.getClient();
    try {
      const query = `
        SELECT EXISTS (
          SELECT 1 
          FROM information_schema.tables 
          WHERE table_schema = $1 AND table_name = $2
        );
      `;

      const result = await client.query(query, [schemaName, tableName]);
      return result.rows[0].exists;
    } catch (error) {
      MigrationLogger.error(
        `Failed to check if table ${schemaName}.${tableName} exists`,
        error
      );
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Check if an index exists in a specific schema
   */
  async indexExists(schemaName: string, indexName: string): Promise<boolean> {
    const client = await this.dbManager.getClient();
    try {
      const query = `
        SELECT EXISTS (
          SELECT 1 
          FROM pg_indexes 
          WHERE schemaname = $1 AND indexname = $2
        );
      `;

      const result = await client.query(query, [schemaName, indexName]);
      return result.rows[0].exists;
    } catch (error) {
      MigrationLogger.error(
        `Failed to check if index ${schemaName}.${indexName} exists`,
        error
      );
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Check if a constraint exists in a specific schema
   */
  async constraintExists(
    schemaName: string,
    tableName: string,
    constraintName: string
  ): Promise<boolean> {
    const client = await this.dbManager.getClient();
    try {
      const query = `
        SELECT EXISTS (
          SELECT 1 
          FROM information_schema.table_constraints 
          WHERE table_schema = $1 AND table_name = $2 AND constraint_name = $3
        );
      `;

      const result = await client.query(query, [
        schemaName,
        tableName,
        constraintName,
      ]);
      return result.rows[0].exists;
    } catch (error) {
      MigrationLogger.error(
        `Failed to check if constraint ${schemaName}.${tableName}.${constraintName} exists`,
        error
      );
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Check if a function exists in a specific schema
   */
  async functionExists(
    schemaName: string,
    functionName: string
  ): Promise<boolean> {
    const client = await this.dbManager.getClient();
    try {
      const query = `
        SELECT EXISTS (
          SELECT 1 
          FROM information_schema.routines 
          WHERE routine_schema = $1 AND routine_name = $2 AND routine_type = 'FUNCTION'
        );
      `;

      const result = await client.query(query, [schemaName, functionName]);
      return result.rows[0].exists;
    } catch (error) {
      MigrationLogger.error(
        `Failed to check if function ${schemaName}.${functionName} exists`,
        error
      );
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Check if a trigger exists in a specific schema
   */
  async triggerExists(
    schemaName: string,
    tableName: string,
    triggerName: string
  ): Promise<boolean> {
    const client = await this.dbManager.getClient();
    try {
      const query = `
        SELECT EXISTS (
          SELECT 1 
          FROM information_schema.triggers 
          WHERE trigger_schema = $1 AND event_object_table = $2 AND trigger_name = $3
        );
      `;

      const result = await client.query(query, [
        schemaName,
        tableName,
        triggerName,
      ]);
      return result.rows[0].exists;
    } catch (error) {
      MigrationLogger.error(
        `Failed to check if trigger ${schemaName}.${tableName}.${triggerName} exists`,
        error
      );
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Execute a query for each schema
   */
  async executeForEachSchema(
    schemas: string[],
    queryExecutor: (schemaName: string, client: PoolClient) => Promise<void>,
    requiresNoTransaction: boolean = false
  ): Promise<void> {
    for (const schemaName of schemas) {
      MigrationLogger.info(`Processing schema: ${schemaName}`);

      if (requiresNoTransaction) {
        MigrationLogger.info(
          `Schema ${schemaName} requires no transaction, executing without transaction`
        );

        // Execute without transaction for CONCURRENTLY operations
        const client = await this.dbManager.getClient();
        try {
          await client.query(`SET search_path TO ${schemaName}, public;`);
          await queryExecutor(schemaName, client);
        } finally {
          client.release();
        }
      } else {
        // Execute with transaction for regular operations
        await this.dbManager.transaction(async client => {
          await client.query(`SET search_path TO ${schemaName}, public;`);
          await queryExecutor(schemaName, client);
        });
      }

      MigrationLogger.info(`Completed processing schema: ${schemaName}`);
    }
  }
}
