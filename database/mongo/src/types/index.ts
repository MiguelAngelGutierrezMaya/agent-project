/**
 * MongoDB Index specification interface.
 */
export interface CollectionIndexSpec {
  /** Index key specification */
  key: Record<string, 1 | -1 | 'text' | '2dsphere'>;
  /** Index options */
  options?: {
    unique?: boolean;
    sparse?: boolean;
    name?: string;
    background?: boolean;
    expireAfterSeconds?: number;
  };
}

/**
 * Migration configuration interface.
 */
export interface MigrationConfig {
  /** MongoDB connection URI */
  uri: string;
  /** Public database name */
  publicDatabase: string;
  /** Databases to ignore when listing tenants */
  ignoreDatabases: string[];
  /** Maximum pool size */
  maxPoolSize: number;
  /** Minimum pool size */
  minPoolSize: number;
  /** Server selection timeout */
  serverSelectionTimeoutMS: number;
  /** Socket timeout */
  socketTimeoutMS: number;
  /** Migration batch size */
  batchSize: number;
  /** Dry run mode */
  dryRun: boolean;
  /** Log level */
  logLevel: 'debug' | 'info' | 'warn' | 'error';
}

/**
 * Migration result interface.
 */
export interface MigrationResult {
  /** Migration name */
  name: string;
  /** Success status */
  success: boolean;
  /** Error message if failed */
  error?: string;
  /** Execution time in milliseconds */
  executionTime: number;
  /** Number of documents processed */
  documentsProcessed: number;
  /** Number of indexes created */
  indexesCreated: number;
}

/**
 * Collection migration interface.
 */
export interface CollectionMigration {
  /** Collection name */
  collectionName: string;
  /** Migration name */
  name: string;
  /** Migration description */
  description: string;
  /** Migration version */
  version: string;
  /** Whether this migration applies to public database */
  isPublic: boolean;
  /** Whether this migration applies to tenant databases */
  isTenant: boolean;
  /** Index definitions */
  indexes: CollectionIndexSpec[];
  /** Migration up function */
  up: (db: any, collectionName: string) => Promise<void>;
  /** Migration down function */
  down: (db: any, collectionName: string) => Promise<void>;
  /** Generate index name from key specification */
  generateIndexName: (
    key: Record<string, 1 | -1 | 'text' | '2dsphere'>
  ) => string;
}

/**
 * Database connection interface.
 */
export interface DatabaseConnection {
  /** Get the public database instance */
  publicDatabase: any;
  /** Get tenant database by schema name */
  getTenantDatabase: (schemaName: string) => any;
  /** List all tenant databases */
  listTenantDatabases: () => Promise<string[]>;
  /** Close connection */
  close: () => Promise<void>;
}
