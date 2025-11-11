import { config } from 'dotenv';
import { DatabaseConfig, MigrationConfig } from '../types/migration';

// Load environment variables
config();

/**
 * Database configuration factory
 */
export class DatabaseConfigFactory {
  /**
   * Create database configuration from environment variables
   */
  static create(): DatabaseConfig {
    const requiredEnvVars = [
      'DB_HOST',
      'DB_PORT',
      'DB_NAME',
      'DB_USER',
      'DB_PASSWORD',
    ];

    for (const envVar of requiredEnvVars) {
      if (!process.env[envVar]) {
        throw new Error(`Missing required environment variable: ${envVar}`);
      }
    }

    return {
      host: process.env['DB_HOST'] || '',
      port: parseInt(process.env['DB_PORT'] || '5432', 10),
      database: process.env['DB_NAME'] || '',
      user: process.env['DB_USER'] || '',
      password: process.env['DB_PASSWORD'] || '',
      ssl:
        process.env['DB_SSL'] === 'true'
          ? { rejectUnauthorized: false }
          : false,
      min: parseInt(process.env['DB_POOL_MIN'] || '2', 10),
      max: parseInt(process.env['DB_POOL_MAX'] || '10', 10),
      idleTimeoutMillis: parseInt(
        process.env['DB_POOL_IDLE_TIMEOUT'] || '30000',
        10
      ),
      connectionTimeoutMillis: parseInt(
        process.env['DB_POOL_CONNECTION_TIMEOUT'] || '2000',
        10
      ),
    };
  }
}

/**
 * Migration configuration factory
 */
export class MigrationConfigFactory {
  /**
   * Create migration configuration from environment variables
   */
  static create(): MigrationConfig {
    return {
      directory: process.env['MIGRATION_DIRECTORY'] || './migrations',
      logMigrations: process.env['LOG_MIGRATIONS'] === 'true',
      logLevel:
        (process.env['LOG_LEVEL'] as 'debug' | 'info' | 'warn' | 'error') ||
        'info',
    };
  }
}

/**
 * Logger utility for migration system
 */
export class MigrationLogger {
  private static logLevel: 'debug' | 'info' | 'warn' | 'error' = 'info';

  static setLogLevel(level: 'debug' | 'info' | 'warn' | 'error'): void {
    this.logLevel = level;
  }

  static debug(message: string, ...args: any[]): void {
    if (this.shouldLog('debug')) {
      console.debug(`[MIGRATION DEBUG] ${message}`, ...args);
    }
  }

  static info(message: string, ...args: any[]): void {
    if (this.shouldLog('info')) {
      console.info(`[MIGRATION INFO] ${message}`, ...args);
    }
  }

  static warn(message: string, ...args: any[]): void {
    if (this.shouldLog('warn')) {
      console.warn(`[MIGRATION WARN] ${message}`, ...args);
    }
  }

  static error(message: string, ...args: any[]): void {
    if (this.shouldLog('error')) {
      console.error(`[MIGRATION ERROR] ${message}`, ...args);
    }
  }

  private static shouldLog(
    level: 'debug' | 'info' | 'warn' | 'error'
  ): boolean {
    const levels = ['debug', 'info', 'warn', 'error'];
    return levels.indexOf(level) >= levels.indexOf(this.logLevel);
  }
}
