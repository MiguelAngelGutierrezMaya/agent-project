import { Injectable, Logger } from '@nestjs/common';
import { PostgresConnectionService } from '@src/shared/persistence/postgresql/postgres-connection.service';
import {
  Product,
  ProductType,
} from '@src/modules/conversation/whatsapp/domain/models/Product';
import { ProductRow } from './product-search-types';
import { EmbeddingProviderFactory } from '@src/modules/conversation/whatsapp/services/ai-providers/providers/embedding-provider.factory';

/**
 * Product Embeddings Search Service
 *
 * @description
 * Injectable NestJS service for semantic product search using vector embeddings.
 * Uses embedding providers to generate query embeddings and performs vector similarity
 * search in PostgreSQL using pgvector.
 *
 * Features:
 * - Semantic product search using vector similarity
 * - Multi-tenant schema support
 * - Configurable similarity threshold
 * - Supports client-specific embedding models
 * - Returns products sorted by relevance (similarity score)
 */
@Injectable()
export class ProductEmbeddingsSearchService {
  private readonly logger = new Logger(ProductEmbeddingsSearchService.name);

  constructor(
    private readonly postgresConnection: PostgresConnectionService,
    private readonly embeddingProviderFactory: EmbeddingProviderFactory
  ) {}

  /**
   * Search products using semantic similarity (vector search)
   *
   * @param schema Client's database schema (for multi-tenancy)
   * @param query Natural language query to search for
   * @param limit Maximum number of results to return (default: 5)
   * @param similarityThreshold Optional minimum similarity threshold.
   *   If not provided, automatically calculated based on query length:
   *
   *   **Dynamic Threshold Calculation (when not provided):**
   *   - **1-2 words**: 0.30 - 0.40 (more permissive for short queries)
   *   - **3-5 words**: 0.50 - 0.60 (balanced, optimal range)
   *   - **6+ words**: 0.60 - 0.70 (more strict for long queries)
   *
   *   **Explicit Threshold (when provided):**
   *   - **Recommended range for product search: 0.55 - 0.65**
   *   - **0.6**: Optimal balance between precision and recall
   *   - **0.55**: More permissive, higher recall
   *   - **0.65**: More strict, higher precision
   *   - **< 0.5**: Too permissive (many false positives)
   *   - **> 0.7**: Too strict (misses relevant results)
   *
   *   **Note**: Threshold recommendations based on:
   *   - HNSW index optimized for cosine similarity (vector_cosine_ops)
   *   - OpenAI text-embedding-3-small model (1536 dimensions)
   *   - Best practices for RAG semantic search
   *   - Dynamic adjustment improves results for queries of different lengths
   *
   * @returns Array of matching products sorted by similarity
   *
   * @description
   * Performs semantic search on product embeddings using vector similarity.
   * Uses HNSW index for efficient approximate nearest neighbor search with cosine similarity.
   *
   * Process:
   * 1. Get embedding model from ai_config table in the client's schema
   * 2. Generate embedding vector for the query text using the appropriate provider
   * 3. Search product_embeddings table using pgvector cosine similarity (HNSW index)
   * 4. Filter by similarity threshold (1 - cosine_distance >= threshold)
   * 5. Join with products and categories to get full product information
   * 6. Return products sorted by similarity score (highest first)
   *
   * Similarity calculation:
   * - Uses cosine similarity: `1 - (embedding <=> query_embedding)`
   * - Range: 0 (completely different) to 1 (identical)
   * - HNSW index provides fast approximate search for large datasets
   *
   * @example
   * ```typescript
   * // Auto-calculated threshold based on query length
   * // "landing" (1 word) → threshold ~0.35
   * const shortQuery = await productEmbeddingsSearch.searchProducts(
   *   'crealodigital',
   *   'landing',
   *   5
   * );
   *
   * // "diseño de logo" (3 words) → threshold ~0.50
   * const mediumQuery = await productEmbeddingsSearch.searchProducts(
   *   'crealodigital',
   *   'diseño de logo',
   *   5
   * );
   *
   * // Explicit threshold override when needed
   * const strictProducts = await productEmbeddingsSearch.searchProducts(
   *   'crealodigital',
   *   'manual de identidad corporativa',
   *   5,
   *   0.65 // Explicit threshold
   * );
   * ```
   */
  async searchProducts(
    schema: string,
    query: string,
    limit: number = 5,
    similarityThreshold?: number
  ): Promise<Product[]> {
    try {
      // Calculate dynamic threshold based on query length if not provided
      const finalThreshold =
        similarityThreshold ?? this.calculateDynamicThreshold(query);

      this.logger.log(
        `Searching products by embedding - Schema: ${schema}, Query: "${query}", Limit: ${limit}, Threshold: ${finalThreshold}${similarityThreshold === undefined ? ' (auto-calculated)' : ' (explicit)'}`
      );

      // Get embedding model from ai_config table
      const embeddingModel = await this.getEmbeddingModelFromDatabase(schema);

      if (!embeddingModel) {
        this.logger.warn(
          `No embedding model configured for schema: ${schema}. Cannot perform semantic search.`
        );
        return [];
      }

      // Get the appropriate embedding provider
      const embeddingProvider =
        this.embeddingProviderFactory.getProvider(embeddingModel);

      // Generate embedding for the query
      const queryEmbedding = await embeddingProvider.generateEmbedding(query);

      if (!queryEmbedding) {
        this.logger.error(
          `Failed to generate embedding for query: "${query}" using model: ${embeddingModel}`
        );
        return [];
      }

      // Perform vector similarity search in PostgreSQL
      const products = await this.performVectorSearch(
        schema,
        queryEmbedding,
        limit,
        finalThreshold
      );

      this.logger.debug(
        `Found ${products.length} products matching query "${query}" with similarity >= ${finalThreshold}`
      );

      return products;
    } catch (error) {
      this.logger.error(
        `Semantic product search error: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined
      );
      return [];
    }
  }

  /**
   * Calculate dynamic similarity threshold based on query length
   *
   * @param query Search query text
   * @returns Calculated threshold based on query characteristics
   * @private
   *
   * @description
   * Adjusts the similarity threshold based on query length to optimize
   * search results for both short and long queries.
   *
   * Rationale:
   * - Short queries (1-2 words): Need lower threshold because single words
   *   provide less semantic context, making embeddings less precise
   * - Medium queries (3-5 words): Optimal range, can use standard threshold
   * - Long queries (6+ words): Can use higher threshold due to rich context
   *
   * Threshold ranges:
   * - 1-2 words: 0.30 - 0.38 (more permissive for short queries)
   * - 3-5 words: 0.50 - 0.60 (balanced)
   * - 6+ words: 0.60 - 0.70 (more strict)
   *
   * @example
   * ```typescript
   * calculateDynamicThreshold("landing") // Returns 0.30 (1 word)
   * calculateDynamicThreshold("diseño logo") // Returns 0.38 (2 words)
   * calculateDynamicThreshold("diseño de logo") // Returns ~0.52 (3 words)
   * calculateDynamicThreshold("manual de identidad corporativa") // Returns ~0.60 (5 words)
   * ```
   */
  private calculateDynamicThreshold(query: string): number {
    if (!query || query.trim().length === 0) {
      return 0.6; // Default fallback
    }

    // Count words (split by whitespace and filter empty strings)
    const words = query
      .trim()
      .split(/\s+/)
      .filter(word => word.length > 0);
    const wordCount = words.length;

    // Calculate threshold based on word count
    if (wordCount <= 2) {
      // Very short queries (1-2 words): Lower threshold
      // Linear interpolation: 1 word = 0.30, 2 words = 0.38
      // More permissive for single words since embeddings are less precise
      return 0.3 + (wordCount - 1) * 0.08;
    } else if (wordCount <= 5) {
      // Medium queries (3-5 words): Balanced threshold
      // Linear interpolation: 3 words = 0.5, 5 words = 0.6
      return 0.45 + (wordCount - 2) * 0.033;
    } else {
      // Long queries (6+ words): Higher threshold
      // Cap at 0.7 for very long queries
      return Math.min(0.6 + (wordCount - 5) * 0.02, 0.7);
    }
  }

  /**
   * Perform vector similarity search in PostgreSQL
   *
   * @param schema Client's database schema
   * @param queryEmbedding Embedding vector for the query
   * @param limit Maximum number of results
   * @param similarityThreshold Minimum similarity threshold
   * @returns Array of matching products
   * @private
   *
   * @description
   * Executes a PostgreSQL query using pgvector to find similar product embeddings.
   * Uses cosine distance (<=>) and converts it to similarity score (1 - distance).
   */
  private async performVectorSearch(
    schema: string,
    queryEmbedding: number[],
    limit: number,
    similarityThreshold: number
  ): Promise<Product[]> {
    const result = await this.postgresConnection.transaction(async client => {
      // Set schema context for multi-tenancy
      await client.query(this.postgresConnection.getSchemaQuery(schema));

      // Search product embeddings using vector similarity
      // Using 1 - cosine_distance to get similarity score (higher = more similar)
      // Using CTE to calculate similarity once and reuse it for filtering and ordering
      const searchQuery = `
        WITH similarity_scores AS (
          SELECT
            pe.product_id,
            1 - (pe.embedding <=> $1::vector) AS similarity
          FROM product_embeddings pe
          WHERE pe.embedding_status = 'completed'
            AND pe.embedding IS NOT NULL
        )
        SELECT
          p.id,
          p.category_id AS "categoryId",
          p.name,
          p.type,
          p.description,
          p.image_url AS "imageUrl",
          p.is_embedded AS "isEmbedded",
          p.is_featured AS "isFeatured",
          p.created_at AS "createdAt",
          p.updated_at AS "updatedAt",
          c.name AS "categoryName",
          c.description AS "categoryDescription",
          c.created_at AS "categoryCreatedAt",
          c.updated_at AS "categoryUpdatedAt",
          ss.similarity
        FROM similarity_scores ss
        INNER JOIN products p ON ss.product_id = p.id
        LEFT JOIN product_categories c ON p.category_id = c.id
        WHERE p.deleted_at IS NULL
          AND c.deleted_at IS NULL
          AND ss.similarity >= $2
        ORDER BY ss.similarity DESC
        LIMIT $3
      `;

      // Convert embedding array to PostgreSQL vector format
      const embeddingVector = JSON.stringify(queryEmbedding);

      const searchResult = await client.query(searchQuery, [
        embeddingVector,
        similarityThreshold,
        limit,
      ]);

      // Transform database rows to Product models
      const products = searchResult.rows.map(row =>
        this.transformRowToProduct(row as ProductRow)
      );

      return products;
    });

    return result;
  }

  /**
   * Transform database row to Product model
   *
   * @param row Database query result row
   * @returns Product model
   * @private
   */
  private transformRowToProduct(row: ProductRow): Product {
    return {
      id: row.id,
      categoryId: row.categoryId,
      name: row.name,
      type: row.type as ProductType,
      description: row.description,
      imageUrl: row.imageUrl,
      isEmbedded: row.isEmbedded,
      isFeatured: row.isFeatured,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      category: {
        id: row.categoryId,
        name: row.categoryName,
        description: row.categoryDescription,
        createdAt: row.categoryCreatedAt,
        updatedAt: row.categoryUpdatedAt,
      },
    };
  }

  /**
   * Get embedding model from ai_config table in the client's schema
   *
   * @param schema Client's database schema
   * @returns Embedding model name or null if not found
   * @private
   *
   * @description
   * Queries the ai_config table to get the embedding model configuration
   * for the client. This is needed to select the correct embedding provider.
   */
  private async getEmbeddingModelFromDatabase(
    schema: string
  ): Promise<string | null> {
    try {
      const result = await this.postgresConnection.transaction(async client => {
        // Set schema context for multi-tenancy
        await client.query(this.postgresConnection.getSchemaQuery(schema));

        // Query for embedding model from ai_config
        const query = `
          SELECT embedding_model
          FROM ai_config
          WHERE embedding_model IS NOT NULL
            AND deleted_at IS NULL
          ORDER BY created_at DESC
          LIMIT 1
        `;

        const configResult = await client.query(query);

        if (configResult.rows.length === 0) {
          return null;
        }

        const row = configResult.rows[0] as { embedding_model: string };
        return row.embedding_model || null;
      });

      return result;
    } catch (error) {
      this.logger.error(
        `Failed to get embedding model from database for schema: ${schema}. Error: ${error instanceof Error ? error.message : String(error)}`
      );
      return null;
    }
  }
}
