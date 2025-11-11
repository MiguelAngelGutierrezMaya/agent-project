import type { Db } from 'mongodb';
import type { CollectionMigration } from '../../src/types';

/**
 * Migration: Create config collection and indexes for tenant databases
 *
 * @description
 * Creates the config collection in tenant databases with the same indexes
 * as client_configs in the public database. This allows each tenant to have
 * their own configuration collection.
 *
 * This migration:
 * 1. Creates config collection in tenant databases only
 * 2. Applies the same indexes as client_configs
 * 3. Ensures data consistency for tenant configurations
 */
export const createConfigCollectionMigration: CollectionMigration = {
  collectionName: 'config',
  name: 'create-config-collection',
  description: 'Create config collection and indexes for tenant databases',
  version: '002',
  isPublic: false,
  isTenant: true,
  indexes: [
    // Same indexes as client_configs but for config collection
    { key: { id: 1 }, options: { unique: true, name: 'idx_config_id' } },
    {
      key: { schema: 1 },
      options: { unique: true, name: 'idx_config_schema' },
    },
    {
      key: { 'socialConfig.whatsappDisplayPhone': 1 },
      options: { unique: true, name: 'idx_config_whatsapp_display_phone' },
    },
    {
      key: { 'billing.status': 1, updatedAt: -1 },
      options: { name: 'idx_config_billing_status_updated' },
    },
    { key: { updatedAt: -1 }, options: { name: 'idx_config_updated_at' } },
    { key: { createdAt: -1 }, options: { name: 'idx_config_created_at' } },
  ],

  /**
   * Migration up function - Create collection and indexes
   */
  async up(db: Db, collectionName: string): Promise<void> {
    console.log(`Creating config collection: ${collectionName}`);
    const collection = db.collection(collectionName);

    // Create collection if it doesn't exist
    await collection.createIndex(
      { id: 1 },
      { unique: true, name: 'idx_config_id' }
    );
    console.log(`   ✅ Created collection: ${collectionName}`);
  },

  /**
   * Migration down function - Drop collection
   */
  async down(db: Db, collectionName: string): Promise<void> {
    console.log(`Dropping config collection: ${collectionName}`);
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
