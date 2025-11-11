/**
 * Main migrations registry
 *
 * @description
 * This module exports all available migrations organized by collection.
 * Each collection has its own module for better organization.
 */

// Import migrations from each collection
import {
  createClientConfigsCollectionMigration,
  createConfigCollectionMigration,
} from './config';
import { createConversationsCollectionMigration } from './conversations';
import { createMessagesCollectionMigration } from './messages';

import type { CollectionMigration } from '../src/types';

/**
 * Registry of all available migrations.
 *
 * @description
 * This registry contains all migration definitions for the MongoDB
 * multi-tenant chat application. Migrations are organized by collection
 * and version to ensure proper execution order.
 */
export const MIGRATIONS: CollectionMigration[] = [
  // Client config collection migrations (public database)
  createClientConfigsCollectionMigration,

  // Config collection migrations (tenant databases)
  createConfigCollectionMigration,

  // Conversations collection migrations
  createConversationsCollectionMigration,

  // Messages collection migrations
  createMessagesCollectionMigration,
];

/**
 * Get migrations by collection name.
 *
 * @param collectionName - Name of the collection
 * @returns Array of migrations for the specified collection
 */
export function getMigrationsByCollection(
  collectionName: string
): CollectionMigration[] {
  return MIGRATIONS.filter(
    migration => migration.collectionName === collectionName
  );
}

/**
 * Get migrations by database type.
 *
 * @param isPublic - Whether to get public or tenant migrations
 * @returns Array of migrations for the specified database type
 */
export function getMigrationsByType(isPublic: boolean): CollectionMigration[] {
  return MIGRATIONS.filter(migration =>
    isPublic ? migration.isPublic : migration.isTenant
  );
}

/**
 * Get all public database migrations.
 *
 * @returns Array of public database migrations
 */
export function getPublicMigrations(): CollectionMigration[] {
  return getMigrationsByType(true);
}

/**
 * Get all tenant database migrations.
 *
 * @returns Array of tenant database migrations
 */
export function getTenantMigrations(): CollectionMigration[] {
  return getMigrationsByType(false);
}

/**
 * Get migration by name.
 *
 * @param name - Migration name
 * @returns Migration with the specified name or undefined
 */
export function getMigrationByName(
  name: string
): CollectionMigration | undefined {
  return MIGRATIONS.find(migration => migration.name === name);
}

/**
 * Get all unique collection names from migrations.
 *
 * @returns Array of unique collection names
 */
export function getAllCollectionNames(): string[] {
  const collectionNames = MIGRATIONS.map(migration => migration.collectionName);
  return [...new Set(collectionNames)];
}
