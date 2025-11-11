import type { Db } from 'mongodb';
import type { CollectionMigration } from '../../src/types';

/**
 * Migration: Create conversations collection and indexes
 *
 * @description
 * Creates the conversations collection in tenant databases
 * with appropriate indexes for conversation management.
 *
 * This migration:
 * 1. Creates conversations collection in tenant databases only
 * 2. Applies indexes optimized for conversation queries
 * 3. Ensures data consistency for conversation tracking
 */
export const createConversationsCollectionMigration: CollectionMigration = {
  collectionName: 'conversations',
  name: 'create-conversations-collection',
  description:
    'Create conversations collection and indexes for tenant databases',
  version: '001',
  isPublic: false,
  isTenant: true,
  indexes: [
    {
      key: { 'user.phoneNumber': 1 },
      options: { unique: true, name: 'idx_conversations_user_phone' },
    },
    {
      key: { status: 1, lastActivityAt: -1 },
      options: { name: 'idx_conversations_status_activity' },
    },
    {
      key: { lastActivityAt: -1 },
      options: { name: 'idx_conversations_last_activity' },
    },
    {
      key: { 'whatsappWindow.expiresAt': 1, 'whatsappWindow.status': 1 },
      options: { name: 'idx_conversations_window_expiration' },
    },
    {
      key: { 'whatsappWindow.status': 1 },
      options: { name: 'idx_conversations_window_status' },
    },
    {
      key: { createdAt: -1 },
      options: { name: 'idx_conversations_created' },
    },
    {
      key: { status: 1, 'user.phoneNumber': 1 },
      options: { name: 'idx_conversations_status_user' },
    },
    {
      key: { closedAt: -1 },
      options: { sparse: true, name: 'idx_conversations_closed' },
    },
  ],

  /**
   * Migration up function - Create collection and indexes
   */
  async up(db: Db, collectionName: string): Promise<void> {
    console.log(`Creating conversations collection: ${collectionName}`);
    const collection = db.collection(collectionName);

    // Create collection if it doesn't exist
    await collection.createIndex(
      { 'user.phoneNumber': 1 },
      { unique: true, name: 'idx_conversations_user_phone' }
    );
    console.log(`   ✅ Created collection: ${collectionName}`);
  },

  /**
   * Migration down function - Drop collection
   */
  async down(db: Db, collectionName: string): Promise<void> {
    console.log(`Dropping conversations collection: ${collectionName}`);
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
