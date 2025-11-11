import type { Db } from 'mongodb';
import type { CollectionMigration } from '../../src/types';

/**
 * Migration: Create messages collection and indexes
 *
 * @description
 * Creates the messages collection in tenant databases
 * with appropriate indexes for message management.
 *
 * This migration:
 * 1. Creates messages collection in tenant databases only
 * 2. Applies indexes optimized for message queries
 * 3. Ensures data consistency for message tracking
 */
export const createMessagesCollectionMigration: CollectionMigration = {
  collectionName: 'messages',
  name: 'create-messages-collection',
  description: 'Create messages collection and indexes for tenant databases',
  version: '001',
  isPublic: false,
  isTenant: true,
  indexes: [
    {
      key: { messageId: 1 },
      options: { unique: true, name: 'idx_messages_message_id' },
    },
    {
      key: { whatsappMessageId: 1 },
      options: {
        sparse: true,
        unique: true,
        name: 'idx_messages_whatsapp_message_id',
      },
    },
    {
      key: { conversationId: 1, timestamp: 1 },
      options: { name: 'idx_messages_conversation_timestamp' },
    },
    {
      key: { conversationId: 1, timestamp: -1 },
      options: { name: 'idx_messages_conversation_timestamp_desc' },
    },
    {
      key: { conversationId: 1, direction: 1, timestamp: 1 },
      options: { name: 'idx_messages_conversation_direction_timestamp' },
    },
    {
      key: { conversationId: 1, sender: 1, timestamp: 1 },
      options: { name: 'idx_messages_conversation_sender_timestamp' },
    },
    { key: { timestamp: -1 }, options: { name: 'idx_messages_timestamp' } },
    {
      key: { status: 1, timestamp: -1 },
      options: { sparse: true, name: 'idx_messages_status_timestamp' },
    },
    { key: { direction: 1 }, options: { name: 'idx_messages_direction' } },
    { key: { sender: 1 }, options: { name: 'idx_messages_sender' } },
    {
      key: { 'aiMetadata.isAiGenerated': 1, timestamp: -1 },
      options: { sparse: true, name: 'idx_messages_ai_generated' },
    },
    {
      key: { readAt: -1 },
      options: { sparse: true, name: 'idx_messages_read_at' },
    },
  ],

  /**
   * Migration up function - Create collection and indexes
   */
  async up(db: Db, collectionName: string): Promise<void> {
    console.log(`Creating messages collection: ${collectionName}`);
    const collection = db.collection(collectionName);

    // Create collection if it doesn't exist
    await collection.createIndex(
      { messageId: 1 },
      { unique: true, name: 'idx_messages_message_id' }
    );
    console.log(`   ✅ Created collection: ${collectionName}`);
  },

  /**
   * Migration down function - Drop collection
   */
  async down(db: Db, collectionName: string): Promise<void> {
    console.log(`Dropping messages collection: ${collectionName}`);
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
