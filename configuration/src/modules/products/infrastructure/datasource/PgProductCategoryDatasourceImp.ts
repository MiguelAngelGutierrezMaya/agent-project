import { ProductCategoryDatasource } from '@modules/products/domain/datasource/ProductCategoryDatasource';
import { ProductCategoriesResponse } from '@modules/products/domain/models/ProductCategory';
import { PostgresConnection } from '@src/infrastructure/shared/persistence/postgresql/PostgresConnection';
import { LoggerService } from '@src/domain/services/Logger';
import { ProductCategoryDTO } from '@modules/products/domain/dto/ProductCategoryDTO';

export class PgProductCategoryDatasourceImp
  implements ProductCategoryDatasource
{
  private postgresConnection: PostgresConnection;
  private logger: LoggerService;

  constructor(logger: LoggerService) {
    this.logger = logger;
    this.postgresConnection = PostgresConnection.getInstance(logger);
  }

  /**
   * Get the schema query for a specific user
   * @param clerkUserId - Clerk user ID
   * @returns string - Schema query
   */
  private getSchemaQuery(clerkUserId: string): string {
    const escapedUserId = clerkUserId.replace(/'/g, "''");

    return `
            DO $$
            DECLARE
                user_schema VARCHAR(100);
            BEGIN
                SELECT brand_schema INTO user_schema
                FROM public.user_brand_mapping
                WHERE clerk_user_id = '${escapedUserId}'
                AND status = 'active'
                AND deleted_at IS NULL;

                IF user_schema IS NULL THEN
                    RAISE EXCEPTION 'User not found in any brand schema';
                END IF;

                EXECUTE format('SET search_path TO %I, public', user_schema);
                
                RAISE NOTICE 'Search path set to: %', user_schema;
            END $$;
        `;
  }

  async getProductCategories(
    userId: string,
    limit?: number,
    offset?: number
  ): Promise<ProductCategoriesResponse> {
    try {
      this.logger.info(
        `Getting product categories for user: ${userId}`,
        PgProductCategoryDatasourceImp.name
      );

      const result = await this.postgresConnection.transaction(async client => {
        await client.query(this.getSchemaQuery(userId));

        // Get total count
        const countResult = await client.query(`
          SELECT COUNT(*) as total
          FROM product_categories
          WHERE deleted_at IS NULL
        `);

        const total = parseInt(countResult.rows[0].total);

        // Get paginated data
        let query = `
          SELECT 
            id,
            name,
            description,
            created_at,
            updated_at
          FROM product_categories
          WHERE deleted_at IS NULL
          ORDER BY created_at DESC
        `;

        const params: any[] = [];
        let paramIndex = 1;

        if (limit) {
          query += ` LIMIT $${paramIndex}`;
          params.push(limit);
          paramIndex++;
        }

        if (offset) {
          query += ` OFFSET $${paramIndex}`;
          params.push(offset);
          paramIndex++;
        }

        const dataResult = await client.query(query, params);

        return {
          rows: dataResult.rows,
          total,
        };
      });

      this.logger.info(
        `Product categories retrieved successfully for User: ${userId}`,
        PgProductCategoryDatasourceImp.name
      );

      const categories = result.rows.map(row => {
        const [productCategoryDTO, error] = ProductCategoryDTO.create({
          id: row.id,
          name: row.name,
          description: row.description,
          createdAt: new Date(row.created_at),
          updatedAt: new Date(row.updated_at),
        });

        if (error) {
          throw error;
        }

        return productCategoryDTO!.toDomain();
      });

      return {
        data: categories,
        total: result.total,
        limit,
        offset,
      };
    } catch (error) {
      this.logger.error(
        `Failed to get product categories for User: ${userId}, Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        PgProductCategoryDatasourceImp.name
      );
      throw error;
    }
  }
}
