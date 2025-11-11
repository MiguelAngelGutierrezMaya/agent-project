import { CompanyModificationDatasource } from '@modules/embedding/domain/datasource/CompanyModificationDatasource';
import { PendingModificationWithConfig } from '@modules/embedding/domain/models/PendingModificationWithConfig';
import { PostgresConnection } from '@src/infrastructure/shared/persistence/postgresql/PostgresConnection';
import { LoggerService } from '@src/domain/services/Logger';
import { PoolClient } from 'pg';
import { CompanyModificationDTO } from '@modules/embedding/domain/dto/CompanyModificationDTO';
import { EmbeddingConfigDTO } from '@modules/embedding/domain/dto/EmbeddingConfigDTO';
import { ModificationStatus } from '@modules/embedding/domain/models/ModificationRequest';

export class PgCompanyModificationDatasourceImp
  implements CompanyModificationDatasource
{
  private postgresConnection: PostgresConnection;
  private logger: LoggerService;

  constructor(logger: LoggerService) {
    this.logger = logger;
    this.postgresConnection = PostgresConnection.getInstance(logger);
  }

  /**
   * Get the schema query for setting schema context
   * @param schema - Database schema name
   * @returns string - Schema query
   */
  private getSchemaQuery(schema: string): string {
    const escapedSchema = schema.replace(/'/g, "''");

    return `
      DO $$
      DECLARE
          user_schema VARCHAR(100);
      BEGIN
          user_schema := '${escapedSchema}';

          EXECUTE format('SET search_path TO %I, public', user_schema);
          
          RAISE NOTICE 'Search path set to: %', user_schema;
      END $$;
    `;
  }

  async getPendingModificationsWithConfig(): Promise<
    PendingModificationWithConfig[]
  > {
    try {
      this.logger.info(
        'Fetching pending modifications with their configurations',
        PgCompanyModificationDatasourceImp.name
      );

      const modifications = await this.postgresConnection.transaction(
        async (client: PoolClient) => {
          // First get pending modifications with JOIN to modification_requests
          const modificationsResult = await client.query(
            `
          SELECT 
            cm.id,
            cm.modification_request_id,
            cm.created_at,
            cm.updated_at,
            cm.deleted_at,
            mr.id as modification_request_mr_id,
            mr.schema_name,
            mr.table_name,
            mr.status,
            mr.created_at as mr_created_at,
            mr.updated_at as mr_updated_at,
            mr.deleted_at as mr_deleted_at
          FROM public.company_modifications cm
          INNER JOIN public.modification_requests mr ON cm.modification_request_id = mr.id
          WHERE mr.status = $1 
            AND mr.deleted_at IS NULL
            AND cm.deleted_at IS NULL
          ORDER BY mr.created_at ASC
        `,
            [ModificationStatus.PENDING]
          );

          const resultList: PendingModificationWithConfig[] = [];

          // For each modification, get its AI config
          for (const row of modificationsResult.rows) {
            // Get AI config for this schema
            const schemaName = row.schema_name as string;

            try {
              await client.query(this.getSchemaQuery(schemaName));

              const configResult = await client.query(`
              SELECT 
                ai.embedding_model,
                ai.batch_embedding,
                md.vector_number
              FROM ai_config ai
              LEFT JOIN public.models_details md ON ai.embedding_model = md.name
              WHERE ai.deleted_at IS NULL
              LIMIT 1
            `);

              if (configResult.rows.length === 0) {
                this.logger.warn(
                  `No AI configuration found for schema: ${schemaName}`,
                  PgCompanyModificationDatasourceImp.name
                );
                continue;
              }

              const configRow = configResult.rows[0];

              // Create CompanyModification DTO from the row data
              const [modificationDTO, modificationError] =
                CompanyModificationDTO.create(row);

              if (modificationError) {
                this.logger.error(
                  `Failed to create modification DTO: ${modificationError.message}`,
                  PgCompanyModificationDatasourceImp.name
                );
                continue;
              }

              // Create EmbeddingConfig DTO
              const [configDTO, configError] = EmbeddingConfigDTO.create({
                schema_name: schemaName,
                embedding_model: configRow.embedding_model,
                batch_embedding: configRow.batch_embedding,
                vector_number: configRow.vector_number,
              });

              if (configError) {
                this.logger.warn(
                  `Skipping modification for schema ${schemaName} due to config error: ${configError.message}`,
                  PgCompanyModificationDatasourceImp.name
                );
                continue;
              }

              resultList.push({
                modification: modificationDTO!.toDomain(),
                config: configDTO!.toDomain(),
              });
            } catch (error) {
              this.logger.warn(
                `Skipping modification for schema ${schemaName} due to error: ${error instanceof Error ? error.message : 'Unknown error'}`,
                PgCompanyModificationDatasourceImp.name
              );
            }
          }

          return resultList;
        }
      );

      this.logger.info(
        `Found ${modifications.length} pending modifications with valid configurations`,
        PgCompanyModificationDatasourceImp.name
      );

      return modifications;
    } catch (error) {
      this.logger.error(
        `Failed to fetch pending modifications with config: ${error instanceof Error ? error.message : 'Unknown error'}`,
        PgCompanyModificationDatasourceImp.name
      );
      throw error;
    }
  }

  async markAsReviewed(companyModificationId: string): Promise<void> {
    try {
      this.logger.info(
        `Marking company modification ${companyModificationId} as reviewed`,
        PgCompanyModificationDatasourceImp.name
      );

      await this.postgresConnection.transaction(async (client: PoolClient) => {
        // Update the modification_request status to REVIEWED through the company_modification relationship
        const result = await client.query(
          `
          UPDATE public.modification_requests mr
          SET status = $1, updated_at = CURRENT_TIMESTAMP
          FROM public.company_modifications cm
          WHERE cm.id = $2
            AND mr.id = cm.modification_request_id
            AND mr.deleted_at IS NULL
            AND cm.deleted_at IS NULL
        `,
          [ModificationStatus.REVIEWED, companyModificationId]
        );

        if (result.rowCount === 0) {
          this.logger.warn(
            `No company modification found to mark as reviewed: ${companyModificationId}`,
            PgCompanyModificationDatasourceImp.name
          );
        }
      });

      this.logger.info(
        `Successfully marked company modification ${companyModificationId} as reviewed`,
        PgCompanyModificationDatasourceImp.name
      );
    } catch (error) {
      this.logger.error(
        `Failed to mark company modification as reviewed: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
        PgCompanyModificationDatasourceImp.name
      );
      throw error;
    }
  }
}
