import type { Db } from 'mongodb';
import type { CollectionMigration } from '../../src/types';

/**
 * Migration: Create client_configs collection and indexes
 *
 * @description
 * Creates the client_configs collection in the public database
 * with appropriate indexes for multi-tenant configuration management.
 *
 * This migration:
 * 1. Creates client_configs collection in public database only
 * 2. Applies indexes optimized for configuration lookups
 * 3. Ensures data consistency for client configurations
 */
export const createClientConfigsCollectionMigration: CollectionMigration = {
  collectionName: 'client_configs',
  name: 'create-client-configs-collection',
  description:
    'Create client_configs collection and indexes for public database only',
  version: '001',
  isPublic: true,
  isTenant: false,
  indexes: [
    // Public database indexes
    {
      key: { id: 1 },
      options: { unique: true, name: 'idx_client_configs_id' },
    },
    {
      key: { schema: 1 },
      options: { unique: true, name: 'idx_client_configs_schema' },
    },
    {
      key: { 'socialConfig.whatsappDisplayPhone': 1 },
      options: {
        unique: true,
        name: 'idx_client_configs_whatsapp_display_phone',
      },
    },
    {
      key: { 'billing.status': 1, updatedAt: -1 },
      options: { name: 'idx_client_configs_billing_status_updated' },
    },
    {
      key: { updatedAt: -1 },
      options: { name: 'idx_client_configs_updated_at' },
    },
    {
      key: { createdAt: -1 },
      options: { name: 'idx_client_configs_created_at' },
    },
  ],

  /**
   * Migration up function - Create collection and indexes
   */
  async up(db: Db, collectionName: string): Promise<void> {
    console.log(`Creating client_configs collection: ${collectionName}`);
    const collection = db.collection(collectionName);

    // Create collection if it doesn't exist
    await collection.createIndex(
      { id: 1 },
      { unique: true, name: 'idx_client_configs_id' }
    );
    console.log(`   ✅ Created collection: ${collectionName}`);
  },

  /**
   * Migration down function - Drop collection
   */
  async down(db: Db, collectionName: string): Promise<void> {
    console.log(`Dropping client_configs collection: ${collectionName}`);
    const collection = db.collection(collectionName);
    await collection.drop();
    console.log(`   ✅ Dropped collection: ${collectionName}`);
  },

  /**
   * Generate index name from key specification
   */
  generateIndexName: (key: Record<string, 1 | -1 | 'text' | '2dsphere'>) => {
    const keyParts = Object.entries(key).map(([field, direction]) => {
      if (direction === 1) return field;
      if (direction === -1) return `${field}_-1`;
      return `${field}_${direction}`;
    });
    return `idx_${keyParts.join('_')}`;
  },
};
