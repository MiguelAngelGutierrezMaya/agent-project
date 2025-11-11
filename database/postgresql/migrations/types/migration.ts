import { PoolClient } from 'pg';

/**
 * Migration interface that defines the structure of a database migration
 */
export interface Migration {
  /** Unique version identifier for the migration */
  version: string;
  /** Human-readable name for the migration */
  name: string;
  /** Whether this migration requires no transaction (for CONCURRENTLY operations) */
  requiresNoTransaction?: boolean;
  /** Function to execute when running the migration */
  up: (client: PoolClient) => Promise<void>;
}

/**
 * Migration record interface for tracking executed migrations
 */
export interface MigrationRecord {
  /** Unique version identifier */
  version: string;
  /** Migration name */
  name: string;
  /** Timestamp when migration was executed */
  executed_at: Date;
  /** Execution time in milliseconds */
  execution_time: number;
  /** Whether the migration was successful */
  success: boolean;
  /** Error message if migration failed */
  error_message?: string;
}

/**
 * Database configuration interface
 */
export interface DatabaseConfig {
  /** Database host */
  host: string;
  /** Database port */
  port: number;
  /** Database name */
  database: string;
  /** Database username */
  user: string;
  /** Database password */
  password: string;
  /** SSL configuration */
  ssl: boolean | object;
  /** Connection pool minimum connections */
  min?: number;
  /** Connection pool maximum connections */
  max?: number;
  /** Connection pool idle timeout */
  idleTimeoutMillis?: number;
  /** Connection pool connection timeout */
  connectionTimeoutMillis?: number;
}

/**
 * Migration configuration interface
 */
export interface MigrationConfig {
  /** Directory path containing migration files */
  directory: string;
  /** Whether to log migration execution */
  logMigrations: boolean;
  /** Log level for migration system */
  logLevel: 'debug' | 'info' | 'warn' | 'error';
}

/**
 * Migration execution result interface
 */
export interface MigrationResult {
  /** Whether the migration was successful */
  success: boolean;
  /** Number of migrations executed */
  executed: number;
  /** Number of migrations rolled back */
  rolledBack: number;
  /** Execution time in milliseconds */
  executionTime: number;
  /** Error message if execution failed */
  error?: string;
  /** Details of executed migrations */
  migrations: MigrationRecord[];
}

/**
 * Migration status interface
 */
export interface MigrationStatus {
  /** List of all available migrations */
  available: Migration[];
  /** List of executed migrations */
  executed: MigrationRecord[];
  /** List of pending migrations */
  pending: Migration[];
  /** Current database version */
  currentVersion: string | null;
  /** Latest available version */
  latestVersion: string | null;
}
