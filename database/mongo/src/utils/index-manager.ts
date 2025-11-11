import type { Db } from 'mongodb';
import type { CollectionIndexSpec } from '../types';

/**
 * Interface for MongoDB index conflict error.
 */
interface MongoIndexError {
  code?: number;
  codeName?: string;
  message?: string;
}

/**
 * Index management service for MongoDB collections.
 *
 * This service handles the creation and management of indexes
 * for both public and tenant collections.
 */
export class IndexManager {
  /**
   * Ensure indexes exist for a collection.
   *
   * @param db - Database instance
   * @param collectionName - Name of the collection
   * @param indexes - Array of index specifications
   * @param dryRun - Whether to perform a dry run
   */
  async ensureCollectionIndexes(
    db: Db,
    collectionName: string,
    indexes: CollectionIndexSpec[],
    dryRun: boolean = false
  ): Promise<void> {
    const collection = db.collection(collectionName);

    console.log(`📊 Ensuring indexes for collection: ${collectionName}`);
    console.log(`   Database: ${db.databaseName}`);
    console.log(`   Indexes to create: ${indexes.length}`);

    if (dryRun) {
      console.log('   🔍 DRY RUN - No indexes will be created');
      return;
    }

    try {
      // Get existing indexes
      const existingIndexes = await collection.indexes();
      const existingIndexNames = existingIndexes.map(idx => idx.name);

      // Create missing indexes
      for (const indexSpec of indexes) {
        const indexName =
          indexSpec.options?.name || this.generateIndexName(indexSpec.key);

        if (existingIndexNames.includes(indexName)) {
          console.log(`   ✓ Index already exists: ${indexName}`);
          continue;
        }

        try {
          await collection.createIndex(indexSpec.key, indexSpec.options);
          console.log(`   ✅ Created index: ${indexName}`);
        } catch (error: any) {
          // Handle specific MongoDB index conflicts
          if (this.isIndexConflictError(error)) {
            console.log(
              `   ⚠️  Index conflict: ${indexName} - ${(error as Error).message}`
            );
            console.log(
              `   ℹ️  Index with same key already exists with different name`
            );
            continue; // Skip this index and continue with others
          }

          // For other errors, still log and throw
          console.error(`   ❌ Failed to create index ${indexName}:`, error);
          throw error;
        }
      }

      // List all indexes for verification
      const finalIndexes = await collection.indexes();
      console.log(
        `   ℹ️  Total indexes in ${collectionName}: ${finalIndexes.length}`
      );
    } catch (error) {
      console.error(`❌ Error ensuring indexes for ${collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Drop indexes for a collection.
   *
   * @param db - Database instance
   * @param collectionName - Name of the collection
   * @param indexNames - Array of index names to drop
   * @param dryRun - Whether to perform a dry run
   */
  async dropCollectionIndexes(
    db: Db,
    collectionName: string,
    indexNames: string[],
    dryRun: boolean = false
  ): Promise<void> {
    const collection = db.collection(collectionName);

    console.log(`🗑️  Dropping indexes for collection: ${collectionName}`);
    console.log(`   Database: ${db.databaseName}`);
    console.log(`   Indexes to drop: ${indexNames.length}`);

    if (dryRun) {
      console.log('   🔍 DRY RUN - No indexes will be dropped');
      return;
    }

    try {
      for (const indexName of indexNames) {
        try {
          await collection.dropIndex(indexName);
          console.log(`   ✅ Dropped index: ${indexName}`);
        } catch (error) {
          console.error(`   ❌ Failed to drop index ${indexName}:`, error);
          // Continue with other indexes even if one fails
        }
      }
    } catch (error) {
      console.error(`❌ Error dropping indexes for ${collectionName}:`, error);
      throw error;
    }
  }

  /**
   * List all indexes for a collection.
   *
   * @param db - Database instance
   * @param collectionName - Name of the collection
   */
  async listCollectionIndexes(db: Db, collectionName: string): Promise<void> {
    const collection = db.collection(collectionName);

    try {
      const indexes = await collection.indexes();
      console.log(`📋 Indexes for ${collectionName} in ${db.databaseName}:`);

      indexes.forEach((index, i) => {
        console.log(`   ${i + 1}. ${index.name}`);
        console.log(`      Key: ${JSON.stringify(index.key)}`);
        if (index.unique) console.log(`      Unique: true`);
        if (index.sparse) console.log(`      Sparse: true`);
        if (index.background) console.log(`      Background: true`);
        if (index.expireAfterSeconds)
          console.log(`      TTL: ${index.expireAfterSeconds}s`);
        console.log('');
      });
    } catch (error) {
      console.error(`❌ Error listing indexes for ${collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Check if the error is an index conflict error.
   *
   * @param error - Error object to check
   * @returns True if it's an index conflict error
   */
  private isIndexConflictError(error: unknown): boolean {
    const mongoError = error as MongoIndexError;
    return (
      mongoError?.code === 85 && // IndexOptionsConflict
      mongoError?.codeName === 'IndexOptionsConflict' &&
      Boolean(
        mongoError?.message?.includes('already exists with a different name')
      )
    );
  }

  /**
   * Generate index name from key specification.
   *
   * @param key - Index key specification
   * @returns Generated index name
   */
  private generateIndexName(
    key: Record<string, 1 | -1 | 'text' | '2dsphere'>
  ): string {
    const keyParts = Object.entries(key).map(([field, direction]) => {
      if (direction === 1) return field;
      if (direction === -1) return `${field}_-1`;
      return `${field}_${direction}`;
    });

    return `idx_${keyParts.join('_')}`;
  }
}
