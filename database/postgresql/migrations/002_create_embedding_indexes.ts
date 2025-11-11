import { PoolClient } from 'pg';
import { Migration } from './types/migration';

/**
 * Migration: Create embedding indexes
 * Version: 002
 * Description: Creates HNSW indexes for efficient vector similarity search in all client schemas
 */
export const migration: Migration = {
  version: '002',
  name: 'create_embedding_indexes',
  requiresNoTransaction: true,

  /**
   * Execute migration up
   */
  up: async (client: PoolClient) => {
    // Get the embedding model configuration for this schema to determine vector dimensions
    const modelResult = await client.query(`
      SELECT ai.embedding_model, md.vector_number
      FROM ai_config ai
      LEFT JOIN public.models_details md ON ai.embedding_model = md.name
      WHERE ai.embedding_model IS NOT NULL
      LIMIT 1;
    `);

    // Default to 1536 if no configuration found
    const vectorDimensions =
      modelResult.rows.length > 0 && modelResult.rows[0].vector_number
        ? modelResult.rows[0].vector_number
        : 1536;

    const embeddingModel =
      modelResult.rows.length > 0
        ? modelResult.rows[0].embedding_model
        : 'text-embedding-ada-002';

    console.log(
      `Creating HNSW indexes for embedding model: ${embeddingModel} with ${vectorDimensions} dimensions`
    );

    // Create HNSW index for product_embeddings with cosine distance if it doesn't exist
    await client.query(`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS product_embeddings_embedding_hnsw_idx 
      ON product_embeddings 
      USING hnsw (embedding vector_cosine_ops) 
      WITH (m = 16, ef_construction = 200);
    `);

    // Create HNSW index for document_embeddings with cosine distance if it doesn't exist
    await client.query(`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS document_embeddings_embedding_hnsw_idx 
      ON document_embeddings 
      USING hnsw (embedding vector_cosine_ops) 
      WITH (m = 16, ef_construction = 200);
    `);

    // Create regular indexes for foreign key lookups if they don't exist
    await client.query(`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS product_embeddings_product_id_idx 
      ON product_embeddings (product_id);
    `);

    await client.query(`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS document_embeddings_document_id_idx 
      ON document_embeddings (document_id);
    `);

    // Create indexes for status filtering if they don't exist
    await client.query(`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS product_embeddings_status_idx 
      ON product_embeddings (embedding_status);
    `);

    await client.query(`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS document_embeddings_status_idx 
      ON document_embeddings (embedding_status);
    `);

    // Create indexes for batch_id filtering if they don't exist
    await client.query(`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS product_embeddings_batch_id_idx 
      ON product_embeddings (batch_id) 
      WHERE batch_id IS NOT NULL;
    `);

    await client.query(`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS document_embeddings_batch_id_idx 
      ON document_embeddings (batch_id) 
      WHERE batch_id IS NOT NULL;
    `);

    // Create composite indexes for batch_id + embedding_status queries
    await client.query(`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS product_embeddings_batch_status_idx 
      ON product_embeddings (batch_id, embedding_status) 
      WHERE batch_id IS NOT NULL;
    `);

    await client.query(`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS document_embeddings_batch_status_idx 
      ON document_embeddings (batch_id, embedding_status) 
      WHERE batch_id IS NOT NULL;
    `);
  },
};
