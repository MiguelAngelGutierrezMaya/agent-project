import { PoolClient } from 'pg';
import { Migration } from './types/migration';

/**
 * Migration: Create embedding tables
 * Version: 001
 * Description: Creates the base tables for storing embeddings (products and documents) in all client schemas
 */
export const migration: Migration = {
  version: '001',
  name: 'create_embedding_tables',

  /**
   * Execute migration up
   */
  up: async (client: PoolClient) => {
    // Get the embedding model configuration for this schema
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
      `Using embedding model: ${embeddingModel} with ${vectorDimensions} dimensions`
    );

    // Create product_embeddings table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS product_embeddings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        product_id UUID NOT NULL UNIQUE,
        content_markdown TEXT NOT NULL,
        embedding public.VECTOR(${vectorDimensions}),
        embedding_model VARCHAR(100) NOT NULL,
        embedding_status VARCHAR(20) DEFAULT 'pending' CHECK (embedding_status IN ('pending', 'processing', 'completed', 'failed')),
        batch_id VARCHAR(255) NULL,
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create document_embeddings table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS document_embeddings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        document_id UUID NOT NULL,
        content_markdown TEXT NOT NULL,
        embedding public.VECTOR(${vectorDimensions}),
        embedding_model VARCHAR(100) NOT NULL,
        embedding_status VARCHAR(20) DEFAULT 'pending' CHECK (embedding_status IN ('pending', 'processing', 'completed', 'failed')),
        batch_id VARCHAR(255) NULL,
        is_chunk BOOLEAN DEFAULT false NOT NULL,
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Enable Row Level Security (RLS) for all embedding tables
    await client.query(
      `ALTER TABLE product_embeddings ENABLE ROW LEVEL SECURITY;`
    );
    await client.query(
      `ALTER TABLE document_embeddings ENABLE ROW LEVEL SECURITY;`
    );

    // Create RLS policies for product_embeddings
    await client.query(`
      DROP POLICY IF EXISTS "Users can view product embeddings" ON product_embeddings;
      CREATE POLICY "Users can view product embeddings" ON product_embeddings
        FOR SELECT USING (true);
    `);

    await client.query(`
      DROP POLICY IF EXISTS "Users can insert product embeddings" ON product_embeddings;
      CREATE POLICY "Users can insert product embeddings" ON product_embeddings
        FOR INSERT WITH CHECK (true);
    `);

    await client.query(`
      DROP POLICY IF EXISTS "Users can update product embeddings" ON product_embeddings;
      CREATE POLICY "Users can update product embeddings" ON product_embeddings
        FOR UPDATE USING (true);
    `);

    await client.query(`
      DROP POLICY IF EXISTS "Users can delete product embeddings" ON product_embeddings;
      CREATE POLICY "Users can delete product embeddings" ON product_embeddings
        FOR DELETE USING (true);
    `);

    // Create RLS policies for document_embeddings
    await client.query(`
      DROP POLICY IF EXISTS "Users can view document embeddings" ON document_embeddings;
      CREATE POLICY "Users can view document embeddings" ON document_embeddings
        FOR SELECT USING (true);
    `);

    await client.query(`
      DROP POLICY IF EXISTS "Users can insert document embeddings" ON document_embeddings;
      CREATE POLICY "Users can insert document embeddings" ON document_embeddings
        FOR INSERT WITH CHECK (true);
    `);

    await client.query(`
      DROP POLICY IF EXISTS "Users can update document embeddings" ON document_embeddings;
      CREATE POLICY "Users can update document embeddings" ON document_embeddings
        FOR UPDATE USING (true);
    `);

    await client.query(`
      DROP POLICY IF EXISTS "Users can delete document embeddings" ON document_embeddings;
      CREATE POLICY "Users can delete document embeddings" ON document_embeddings
        FOR DELETE USING (true);
    `);
  },
};
