/**
 * Custom error classes for migration system
 */

/**
 * Base migration error class
 */
export class MigrationError extends Error {
  constructor(
    message: string,
    public readonly migrationVersion?: string
  ) {
    super(message);
    this.name = 'MigrationError';
  }
}

/**
 * Error thrown when migration file is not found
 */
export class MigrationNotFoundError extends MigrationError {
  constructor(version: string) {
    super(`Migration with version '${version}' not found`, version);
    this.name = 'MigrationNotFoundError';
  }
}

/**
 * Error thrown when migration execution fails
 */
export class MigrationExecutionError extends MigrationError {
  public readonly cause: Error;

  constructor(version: string, originalError: Error) {
    super(
      `Migration '${version}' execution failed: ${originalError.message}`,
      version
    );
    this.name = 'MigrationExecutionError';
    this.cause = originalError;
  }
}

/**
 * Error thrown when migration rollback fails
 */
export class MigrationRollbackError extends MigrationError {
  public readonly cause: Error;

  constructor(version: string, originalError: Error) {
    super(
      `Migration '${version}' rollback failed: ${originalError.message}`,
      version
    );
    this.name = 'MigrationRollbackError';
    this.cause = originalError;
  }
}

/**
 * Error thrown when database connection fails
 */
export class DatabaseConnectionError extends MigrationError {
  constructor(message: string) {
    super(`Database connection failed: ${message}`);
    this.name = 'DatabaseConnectionError';
  }
}

/**
 * Error thrown when migration table operations fail
 */
export class MigrationTableError extends MigrationError {
  constructor(message: string) {
    super(`Migration table operation failed: ${message}`);
    this.name = 'MigrationTableError';
  }
}

/**
 * Error thrown when migration validation fails
 */
export class MigrationValidationError extends MigrationError {
  constructor(message: string, version?: string) {
    super(`Migration validation failed: ${message}`, version);
    this.name = 'MigrationValidationError';
  }
}
