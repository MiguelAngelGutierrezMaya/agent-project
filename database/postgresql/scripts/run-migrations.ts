#!/usr/bin/env ts-node

import { MigrationRunner } from '../migrations/index';
import { MigrationRecord } from '../migrations/types/migration';

/**
 * Script to run migrations up
 * Usage: ts-node run-migrations.ts up [target_version]
 */
async function main() {
  const command = process.argv[2];
  const targetVersion = process.argv[3];

  if (!command || command !== 'up') {
    console.error('Usage: ts-node run-migrations.ts up [target_version]');
    console.error('Examples:');
    console.error('  ts-node run-migrations.ts up');
    console.error('  ts-node run-migrations.ts up 003');
    process.exit(1);
  }

  const runner = new MigrationRunner();

  try {
    // Test database connection first
    const dbManager = (runner as any).dbManager;
    const isConnected = await dbManager.testConnection();

    if (!isConnected) {
      console.error('❌ Failed to connect to database');
      process.exit(1);
    }

    console.log('✅ Database connection successful');
    console.log(
      `🔄 Running migrations up${targetVersion ? ` to version ${targetVersion}` : ''}...`
    );

    const result = await runner.up(targetVersion);

    if (result.success) {
      console.log('✅ Migration completed successfully');
      console.log(
        `📊 Executed: ${result.executed}, Rolled back: ${result.rolledBack}`
      );
      console.log(`⏱️  Execution time: ${result.executionTime}ms`);

      if (result.migrations.length > 0) {
        console.log('\n📋 Migration details:');
        result.migrations.forEach((migration: MigrationRecord) => {
          const status = migration.success ? '✅' : '❌';
          console.log(
            `  ${status} ${migration.version} - ${migration.name} (${migration.execution_time}ms)`
          );
          if (migration.error_message) {
            console.log(`     Error: ${migration.error_message}`);
          }
        });
      }
    } else {
      console.error('❌ Migration failed');
      console.error(`Error: ${result.error}`);
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Migration script failed:', error);
    process.exit(1);
  } finally {
    await runner.close();
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', error => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', reason => {
  console.error('❌ Unhandled Rejection:', reason);
  process.exit(1);
});

main().catch(error => {
  console.error('❌ Script execution failed:', error);
  process.exit(1);
});
