import { readdir } from 'fs/promises';
import { extname } from 'path';
import { Migration, MigrationRecord, MigrationResult } from './types/migration';
import { MigrationConfigFactory, MigrationLogger } from './config/database';
import { DatabaseManager } from './config/connection';
import { SchemaManager } from './config/schema-manager';
import { MigrationExecutionError } from './types/errors';

/**
 * Main migration runner class - simplified to only handle 'up' migrations
 */
export class MigrationRunner {
  private dbManager: DatabaseManager;
  private schemaManager: SchemaManager;
  private config: ReturnType<typeof MigrationConfigFactory.create>;
  private migrations: Map<string, Migration> = new Map();

  constructor(dbManager?: DatabaseManager) {
    this.dbManager = dbManager || new DatabaseManager();
    this.schemaManager = new SchemaManager(this.dbManager);
    this.config = MigrationConfigFactory.create();
    MigrationLogger.setLogLevel(this.config.logLevel);
  }

  /**
   * Load all migration files from the migrations directory
   */
  async loadMigrations(): Promise<void> {
    try {
      const migrationFiles = await readdir(this.config.directory);
      const tsFiles = migrationFiles.filter(
        file => extname(file) === '.ts' && file !== 'index.ts'
      );

      MigrationLogger.info(`Loading ${tsFiles.length} migration files`);

      for (const file of tsFiles) {
        try {
          const migrationModule = await import(`./${file}`);

          if (migrationModule.migration) {
            const migration = migrationModule.migration as Migration;
            this.migrations.set(migration.version, migration);
            MigrationLogger.debug(
              `Loaded migration: ${migration.version} - ${migration.name}`
            );
          } else {
            MigrationLogger.warn(
              `Migration file ${file} does not export a migration object`
            );
          }
        } catch (error) {
          MigrationLogger.error(`Failed to load migration file ${file}`, error);
          throw error;
        }
      }

      MigrationLogger.info(
        `Successfully loaded ${this.migrations.size} migrations`
      );
    } catch (error) {
      MigrationLogger.error('Failed to load migrations', error);
      throw error;
    }
  }

  /**
   * Execute migrations up to a specific version (or all if no version specified)
   */
  async up(targetVersion?: string): Promise<MigrationResult> {
    const startTime = Date.now();
    const executedMigrations: MigrationRecord[] = [];

    try {
      await this.loadMigrations();

      const schemasToProcess = await this.schemaManager.getSchemasToProcess();

      const availableMigrations = Array.from(this.migrations.values()).sort(
        (a, b) => a.version.localeCompare(b.version)
      );

      MigrationLogger.info(
        `Running ${availableMigrations.length} migrations across ${schemasToProcess.length} schemas`
      );

      for (const migration of availableMigrations) {
        const migrationStartTime = Date.now();
        let migrationRecord: MigrationRecord;

        try {
          MigrationLogger.info(
            `Running migration: ${migration.version} - ${migration.name}`
          );

          // Execute migration for each schema
          await this.schemaManager.executeForEachSchema(
            schemasToProcess,
            async (_schemaName, client) => {
              await migration.up(client);
            },
            migration.requiresNoTransaction || false
          );

          const executionTime = Date.now() - migrationStartTime;
          migrationRecord = {
            version: migration.version,
            name: migration.name,
            success: true,
            execution_time: executionTime,
            executed_at: new Date(),
          };

          MigrationLogger.info(
            `Migration ${migration.version} completed successfully in ${executionTime}ms across ${schemasToProcess.length} schemas`
          );
        } catch (error) {
          const executionTime = Date.now() - migrationStartTime;
          migrationRecord = {
            version: migration.version,
            name: migration.name,
            success: false,
            execution_time: executionTime,
            executed_at: new Date(),
            error_message:
              error instanceof Error ? error.message : String(error),
          };

          MigrationLogger.error(`Migration ${migration.version} failed`, error);

          throw new MigrationExecutionError(migration.version, error as Error);
        }

        executedMigrations.push(migrationRecord);

        // Stop if we've reached the target version
        if (targetVersion && migration.version === targetVersion) {
          MigrationLogger.info(
            `Reached target version ${targetVersion}, stopping migration`
          );
          break;
        }
      }

      const executionTime = Date.now() - startTime;
      MigrationLogger.info(`Migration run completed in ${executionTime}ms`);

      return {
        success: true,
        executed: executedMigrations.length,
        rolledBack: 0,
        executionTime,
        migrations: executedMigrations,
      };
    } catch (error) {
      const executionTime = Date.now() - startTime;
      MigrationLogger.error('Migration run failed', error);

      return {
        success: false,
        executed: executedMigrations.length,
        rolledBack: 0,
        executionTime,
        migrations: executedMigrations,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Close database connections
   */
  async close(): Promise<void> {
    await this.dbManager.close();
  }
}
