#!/usr/bin/env node

import { Command } from 'commander';
import dotenv from 'dotenv';
import { DatabaseConnectionService } from './utils/database-connection';
import { IndexManager } from './utils/index-manager';
import { MigrationService } from './migration-service';
import {
  MIGRATIONS,
  getMigrationsByCollection,
  getPublicMigrations,
  getTenantMigrations,
} from './migrations-registry';
import type { MigrationConfig } from './types';

// Load environment variables
dotenv.config();

/**
 * Interface for migrate command options.
 */
interface MigrateOptions {
  dryRun?: boolean;
  collection?: string;
  publicOnly?: boolean;
  tenantsOnly?: boolean;
}

/**
 * Interface for sync-indexes command options.
 */
interface SyncIndexesOptions {
  dryRun?: boolean;
}

/**
 * Load configuration from environment variables.
 */
function loadConfig(): MigrationConfig {
  // Parse IGNORE_DATABASES from environment variable (comma-separated)
  const ignoreDatabasesEnv = process.env.IGNORE_DATABASES || '';
  const ignoreDatabases = ignoreDatabasesEnv
    ? ignoreDatabasesEnv
        .split(',')
        .map(db => db.trim())
        .filter(db => db.length > 0)
    : [];
  ignoreDatabases.push('admin', 'config', 'local', 'sample_mflix');

  return {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017',
    publicDatabase: process.env.MONGODB_PUBLIC_DATABASE || 'chat_public',
    ignoreDatabases,
    maxPoolSize: parseInt(process.env.MONGODB_MAX_POOL_SIZE || '10'),
    minPoolSize: parseInt(process.env.MONGODB_MIN_POOL_SIZE || '2'),
    serverSelectionTimeoutMS: parseInt(
      process.env.MONGODB_SERVER_SELECTION_TIMEOUT_MS || '5000'
    ),
    socketTimeoutMS: parseInt(process.env.MONGODB_SOCKET_TIMEOUT_MS || '45000'),
    batchSize: parseInt(process.env.MIGRATION_BATCH_SIZE || '100'),
    dryRun: process.env.MIGRATION_DRY_RUN === 'true',
    logLevel:
      (process.env.MIGRATION_LOG_LEVEL as
        | 'debug'
        | 'info'
        | 'warn'
        | 'error') || 'info',
  };
}

/**
 * Main migration function.
 */
function main(): void {
  const program = new Command();

  program
    .name('mongo-migrations')
    .description('MongoDB migrations for multi-tenant chat application')
    .version('1.0.0');

  program
    .command('migrate')
    .description('Run all migrations')
    .option('-d, --dry-run', 'Perform a dry run without making changes')
    .option(
      '-c, --collection <name>',
      'Run migrations for specific collection only'
    )
    .option('-p, --public-only', 'Run only public database migrations')
    .option('-t, --tenants-only', 'Run only tenant database migrations')
    .action(async (options: MigrateOptions) => {
      let dbConnection: DatabaseConnectionService | undefined;

      try {
        const config = loadConfig();
        if (options.dryRun) {
          config.dryRun = true;
        }

        dbConnection = new DatabaseConnectionService(config);
        const indexManager = new IndexManager();
        const migrationService = new MigrationService(
          dbConnection,
          indexManager,
          config.dryRun
        );

        await dbConnection.connect();

        let migrationsToRun = MIGRATIONS;

        if (options.collection) {
          migrationsToRun = getMigrationsByCollection(options.collection);
          if (migrationsToRun.length === 0) {
            console.log(
              `❌ No migrations found for collection: ${options.collection}`
            );
            process.exit(1);
          }
        } else if (options.publicOnly) {
          migrationsToRun = getPublicMigrations();
        } else if (options.tenantsOnly) {
          migrationsToRun = getTenantMigrations();
        }

        const results =
          await migrationService.executeAllMigrations(migrationsToRun);

        const failed = results.filter(r => !r.success).length;
        if (failed > 0) {
          console.log(`\n❌ ${failed} migration(s) failed`);
          process.exit(1);
        } else {
          console.log('\n✅ All migrations completed successfully');
        }
      } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
      } finally {
        // Close database connection
        if (dbConnection) {
          await dbConnection.close();
        }
      }
    });

  program
    .command('sync-indexes')
    .description('Sync indexes for all collections')
    .option('-d, --dry-run', 'Perform a dry run without making changes')
    .action(async (options: SyncIndexesOptions) => {
      let dbConnection: DatabaseConnectionService | undefined;

      try {
        const config = loadConfig();
        if (options.dryRun) {
          config.dryRun = true;
        }

        dbConnection = new DatabaseConnectionService(config);
        const indexManager = new IndexManager();
        const migrationService = new MigrationService(
          dbConnection,
          indexManager,
          config.dryRun
        );

        await dbConnection.connect();
        await migrationService.syncIndexes(MIGRATIONS);

        console.log('✅ Index sync completed successfully');
      } catch (error) {
        console.error('❌ Index sync failed:', error);
        process.exit(1);
      } finally {
        // Close database connection
        if (dbConnection) {
          await dbConnection.close();
        }
      }
    });

  program
    .command('list')
    .description('List all available migrations')
    .action(() => {
      console.log('📋 Available Migrations');
      console.log('======================');

      MIGRATIONS.forEach((migration, index: number) => {
        console.log(`\n${index + 1}. ${migration.name}`);
        console.log(`   Collection: ${migration.collectionName}`);
        console.log(`   Description: ${migration.description}`);
        console.log(`   Version: ${migration.version}`);
        console.log(`   Public: ${migration.isPublic ? 'Yes' : 'No'}`);
        console.log(`   Tenant: ${migration.isTenant ? 'Yes' : 'No'}`);
        console.log(`   Indexes: ${migration.indexes.length}`);
      });

      console.log(`\nTotal migrations: ${MIGRATIONS.length}`);
    });

  program
    .command('status')
    .description('Show migration status and database information')
    .action(async () => {
      let dbConnection: DatabaseConnectionService | undefined;

      try {
        const config = loadConfig();
        dbConnection = new DatabaseConnectionService(config);

        await dbConnection.connect();

        console.log('📊 Database Status');
        console.log('=================');
        console.log(`   Public database: ${config.publicDatabase}`);
        console.log(`   Connection URI: ${config.uri}`);

        // List tenant databases
        const tenantDatabases = await dbConnection.listTenantDatabases();
        console.log(`   Tenant databases: ${tenantDatabases.length}`);
        tenantDatabases.forEach(dbName => {
          console.log(`     - ${dbName}`);
        });

        console.log('\n📋 Available Collections');
        console.log('========================');

        const collections = [
          'client_configs',
          'config',
          'conversations',
          'messages',
        ];
        for (const collectionName of collections) {
          try {
            const collection =
              dbConnection.publicDatabase.collection(collectionName);
            const indexes = await collection.indexes();
            console.log(`   ${collectionName}: ${indexes.length} indexes`);
          } catch {
            console.log(`   ${collectionName}: Not found`);
          }
        }
      } catch (error) {
        console.error('❌ Status check failed:', error);
        process.exit(1);
      } finally {
        // Close database connection
        if (dbConnection) {
          await dbConnection.close();
        }
      }
    });

  // Parse command line arguments
  program.parse();
}

// Run the application
if (require.main === module) {
  try {
    main();
  } catch (error: unknown) {
    console.error(
      '💥 Fatal error:',
      error instanceof Error ? error.message : String(error)
    );
    process.exit(1);
  }
}
