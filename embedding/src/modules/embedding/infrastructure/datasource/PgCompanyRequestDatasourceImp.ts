import { CompanyRequestDatasource } from '@modules/embedding/domain/datasource/CompanyRequestDatasource';
import { PostgresConnection } from '@src/infrastructure/shared/persistence/postgresql/PostgresConnection';
import { LoggerService } from '@src/domain/services/Logger';
import { PoolClient } from 'pg';
import { ModificationStatus } from '@modules/embedding/domain/models/ModificationRequest';
import type { CompanyRequest } from '@modules/embedding/domain/models/CompanyRequest';
import { CompanyRequestDTO } from '@modules/embedding/domain/dto/CompanyRequestDTO';

export class PgCompanyRequestDatasourceImp implements CompanyRequestDatasource {
  private postgresConnection: PostgresConnection;
  private logger: LoggerService;

  constructor(logger: LoggerService) {
    this.logger = logger;
    this.postgresConnection = PostgresConnection.getInstance(logger);
  }

  async createCompanyRequest(
    schemaName: string,
    tableName: string
  ): Promise<string> {
    try {
      this.logger.info(
        `Creating company request for schema: ${schemaName}, table: ${tableName}`,
        PgCompanyRequestDatasourceImp.name
      );

      const result = await this.postgresConnection.transaction(
        async (client: PoolClient) => {
          // First, create a new modification request
          const insertModificationResult = await client.query(
            `
            INSERT INTO public.modification_requests (
              schema_name, table_name, status
            ) VALUES ($1, $2, $3)
            RETURNING id
          `,
            [schemaName, tableName, ModificationStatus.PENDING]
          );

          const modificationRequestId = insertModificationResult.rows[0].id;

          this.logger.info(
            `Created new modification request with ID: ${modificationRequestId}`,
            PgCompanyRequestDatasourceImp.name
          );

          // Then, create the company request
          const insertResult = await client.query(
            `
            INSERT INTO public.company_requests (
              modification_request_id
            ) VALUES ($1)
            RETURNING id
          `,
            [modificationRequestId]
          );

          this.logger.info(
            `Created new company request record with ID: ${insertResult.rows[0].id}`,
            PgCompanyRequestDatasourceImp.name
          );

          return insertResult.rows[0].id;
        }
      );

      this.logger.info(
        `Successfully created company request with ID: ${result} for schema: ${schemaName}, table: ${tableName}`,
        PgCompanyRequestDatasourceImp.name
      );

      return result;
    } catch (error) {
      this.logger.error(
        `Failed to create company request for schema: ${schemaName}, table: ${tableName}, Error: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
        PgCompanyRequestDatasourceImp.name
      );
      throw error;
    }
  }

  async getPendingBatchRequests(): Promise<CompanyRequest[]> {
    try {
      this.logger.info(
        'Fetching pending batch requests',
        PgCompanyRequestDatasourceImp.name
      );

      const result = await this.postgresConnection.query(
        `
          SELECT 
            cr.id,
            cr.modification_request_id,
            cr.created_at,
            cr.updated_at,
            cr.deleted_at,
            mr.schema_name,
            mr.table_name,
            mr.status,
            mr.created_at as modification_request_created_at,
            mr.updated_at as modification_request_updated_at,
            mr.deleted_at as modification_request_deleted_at
          FROM public.company_requests cr
          INNER JOIN public.modification_requests mr 
            ON cr.modification_request_id = mr.id
          WHERE 
            cr.deleted_at IS NULL 
            AND mr.deleted_at IS NULL
            AND mr.status = $1
          ORDER BY cr.created_at ASC
        `,
        [ModificationStatus.PENDING]
      );

      this.logger.info(
        `Found ${result.rows.length} pending batch requests`,
        PgCompanyRequestDatasourceImp.name
      );

      const companyRequests: CompanyRequest[] = [];

      for (const row of result.rows) {
        const [dto, error] = CompanyRequestDTO.create({
          id: row.id,
          modification_request_id: row.modification_request_id,
          created_at: row.created_at,
          updated_at: row.updated_at,
          deleted_at: row.deleted_at,
          schema_name: row.schema_name,
          table_name: row.table_name,
          status: row.status,
          mr_created_at: row.modification_request_created_at,
          mr_updated_at: row.modification_request_updated_at,
          mr_deleted_at: row.modification_request_deleted_at,
        });

        if (error) {
          this.logger.error(
            `Failed to create company request DTO: ${error.message}`,
            PgCompanyRequestDatasourceImp.name
          );
          continue;
        }

        companyRequests.push(dto!.toDomain());
      }

      this.logger.info(
        `Successfully retrieved ${companyRequests.length} pending batch requests`,
        PgCompanyRequestDatasourceImp.name
      );

      return companyRequests;
    } catch (error) {
      this.logger.error(
        `Failed to get pending batch requests. Error: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
        PgCompanyRequestDatasourceImp.name
      );
      throw error;
    }
  }

  async markAsReviewed(companyRequestId: string): Promise<void> {
    try {
      this.logger.info(
        `Marking company request ${companyRequestId} as reviewed`,
        PgCompanyRequestDatasourceImp.name
      );

      await this.postgresConnection.transaction(async (client: PoolClient) => {
        // Update the modification_request status to REVIEWED
        const result = await client.query(
          `
          UPDATE public.modification_requests mr
          SET status = $1, updated_at = CURRENT_TIMESTAMP
          FROM public.company_requests cr
          WHERE cr.id = $2
            AND mr.id = cr.modification_request_id
            AND mr.deleted_at IS NULL
            AND cr.deleted_at IS NULL
        `,
          [ModificationStatus.REVIEWED, companyRequestId]
        );

        if (result.rowCount === 0) {
          this.logger.warn(
            `No company request found to mark as reviewed: ${companyRequestId}`,
            PgCompanyRequestDatasourceImp.name
          );
        }
      });

      this.logger.info(
        `Successfully marked company request ${companyRequestId} as reviewed`,
        PgCompanyRequestDatasourceImp.name
      );
    } catch (error) {
      this.logger.error(
        `Failed to mark company request as reviewed: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
        PgCompanyRequestDatasourceImp.name
      );
      throw error;
    }
  }
}
