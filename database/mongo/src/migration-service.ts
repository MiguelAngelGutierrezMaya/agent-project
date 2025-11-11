import type { Db } from 'mongodb';
import type { CollectionMigration, MigrationResult } from './types';
import { DatabaseConnectionService } from './utils/database-connection';
import { IndexManager } from './utils/index-manager';

/**
 * Migration service for MongoDB multi-tenant chat application.
 *
 * This service handles the execution of migrations for both public
 * and tenant databases, ensuring proper index creation and data consistency.
 */
export class MigrationService {
  private dbConnection: DatabaseConnectionService;
  private indexManager: IndexManager;
  private dryRun: boolean;

  constructor(
    dbConnection: DatabaseConnectionService,
    indexManager: IndexManager,
    dryRun: boolean = false
  ) {
    this.dbConnection = dbConnection;
    this.indexManager = indexManager;
    this.dryRun = dryRun;
  }

  /**
   * Execute all migrations.
   *
   * @param migrations - Array of migrations to execute
   * @returns Array of migration results
   */
  async executeAllMigrations(
    migrations: CollectionMigration[]
  ): Promise<MigrationResult[]> {
    console.log('🚀 Starting migration execution...');
    console.log(`   Total migrations: ${migrations.length}`);
    console.log(`   Dry run: ${this.dryRun ? 'Yes' : 'No'}`);

    const results: MigrationResult[] = [];

    try {
      // Execute public database migrations
      const publicMigrations = migrations.filter(m => m.isPublic);
      if (publicMigrations.length > 0) {
        console.log(
          `\n📊 Executing public database migrations (${publicMigrations.length})...`
        );
        const publicResults = await this.executeMigrationsForDatabase(
          this.dbConnection.publicDatabase,
          publicMigrations,
          'public'
        );
        results.push(...publicResults);
      }

      // Execute tenant database migrations
      const tenantMigrations = migrations.filter(m => m.isTenant);
      if (tenantMigrations.length > 0) {
        console.log(
          `\n🏢 Executing tenant database migrations (${tenantMigrations.length})...`
        );
        const tenantDatabases = await this.dbConnection.listTenantDatabases();

        for (const schemaName of tenantDatabases) {
          const tenantDb = this.dbConnection.getTenantDatabase(schemaName);
          const tenantResults = await this.executeMigrationsForDatabase(
            tenantDb,
            tenantMigrations,
            schemaName
          );
          results.push(...tenantResults);
        }
      }

      // Summary
      this.printMigrationSummary(results);
    } catch (error) {
      console.error('❌ Error during migration execution:', error);
      throw error;
    }

    return results;
  }

  /**
   * Execute migrations for a specific database.
   *
   * @param db - Database instance
   * @param migrations - Array of migrations to execute
   * @param databaseName - Name of the database for logging
   * @returns Array of migration results
   */
  private async executeMigrationsForDatabase(
    db: Db,
    migrations: CollectionMigration[],
    databaseName: string
  ): Promise<MigrationResult[]> {
    const results: MigrationResult[] = [];

    console.log(`\n   Database: ${databaseName}`);

    for (const migration of migrations) {
      const startTime = Date.now();
      const result: MigrationResult = {
        name: migration.name,
        success: false,
        executionTime: 0,
        documentsProcessed: 0,
        indexesCreated: 0,
      };

      try {
        console.log(`\n   🔄 Executing migration: ${migration.name}`);
        console.log(`      Description: ${migration.description}`);
        console.log(`      Collection: ${migration.collectionName}`);

        if (this.dryRun) {
          console.log(`      🔍 DRY RUN - Migration would be executed`);
          result.success = true;
        } else {
          await migration.up(db, migration.collectionName);
          result.success = true;
        }

        result.indexesCreated = migration.indexes.length;
        result.executionTime = Date.now() - startTime;

        console.log(`      ✅ Migration completed successfully`);
        console.log(`      ⏱️  Execution time: ${result.executionTime}ms`);
      } catch (error) {
        result.success = false;
        result.error = error instanceof Error ? error.message : String(error);
        result.executionTime = Date.now() - startTime;

        console.error(`      ❌ Migration failed: ${result.error}`);
      }

      results.push(result);
    }

    return results;
  }

  /**
   * Execute migrations for a specific collection.
   *
   * @param collectionName - Name of the collection
   * @param migrations - Array of migrations to execute
   * @returns Array of migration results
   */
  async executeCollectionMigrations(
    collectionName: string,
    migrations: CollectionMigration[]
  ): Promise<MigrationResult[]> {
    console.log(`📊 Executing migrations for collection: ${collectionName}`);

    const collectionMigrations = migrations.filter(
      m => m.collectionName === collectionName
    );
    if (collectionMigrations.length === 0) {
      console.log(
        `   ⚠️  No migrations found for collection: ${collectionName}`
      );
      return [];
    }

    return this.executeAllMigrations(collectionMigrations);
  }

  /**
   * Sync indexes for all collections.
   *
   * @param migrations - Array of migrations containing index definitions
   */
  async syncIndexes(migrations: CollectionMigration[]): Promise<void> {
    console.log('🔄 Syncing indexes for all collections...');

    try {
      // Sync public database indexes
      const publicMigrations = migrations.filter(m => m.isPublic);
      if (publicMigrations.length > 0) {
        console.log(`\n📊 Syncing public database indexes...`);
        await this.syncDatabaseIndexes(
          this.dbConnection.publicDatabase,
          publicMigrations
        );
      }

      // Sync tenant database indexes
      const tenantMigrations = migrations.filter(m => m.isTenant);
      if (tenantMigrations.length > 0) {
        console.log(`\n🏢 Syncing tenant database indexes...`);
        const tenantDatabases = await this.dbConnection.listTenantDatabases();

        for (const schemaName of tenantDatabases) {
          const tenantDb = this.dbConnection.getTenantDatabase(schemaName);
          await this.syncDatabaseIndexes(tenantDb, tenantMigrations);
        }
      }

      console.log('✅ Index sync completed successfully');
    } catch (error) {
      console.error('❌ Error during index sync:', error);
      throw error;
    }
  }

  /**
   * Sync indexes for a specific database.
   *
   * @param db - Database instance
   * @param migrations - Array of migrations containing index definitions
   */
  private async syncDatabaseIndexes(
    db: Db,
    migrations: CollectionMigration[]
  ): Promise<void> {
    console.log(`   Database: ${db.databaseName}`);

    for (const migration of migrations) {
      console.log(
        `   🔄 Syncing indexes for collection: ${migration.collectionName}`
      );

      await this.indexManager.ensureCollectionIndexes(
        db,
        migration.collectionName,
        migration.indexes,
        this.dryRun
      );
    }
  }

  /**
   * Print migration execution summary.
   *
   * @param results - Array of migration results
   */
  private printMigrationSummary(results: MigrationResult[]): void {
    console.log('\n📊 Migration Summary');
    console.log('==================');

    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    const totalTime = results.reduce((sum, r) => sum + r.executionTime, 0);
    const totalIndexes = results.reduce((sum, r) => sum + r.indexesCreated, 0);

    console.log(`   Total migrations: ${results.length}`);
    console.log(`   Successful: ${successful}`);
    console.log(`   Failed: ${failed}`);
    console.log(`   Total execution time: ${totalTime}ms`);
    console.log(`   Total indexes created: ${totalIndexes}`);

    if (failed > 0) {
      console.log('\n❌ Failed migrations:');
      results
        .filter(r => !r.success)
        .forEach(r => {
          console.log(`   - ${r.name}: ${r.error}`);
        });
    }

    if (this.dryRun) {
      console.log('\n🔍 This was a dry run - no changes were made');
    }
  }
}
