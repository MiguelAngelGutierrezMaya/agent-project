import { CompanyModificationDatasource } from '@modules/shared/domain/datasource/CompanyModificationDatasource';
import { PostgresConnection } from '@src/infrastructure/shared/persistence/postgresql/PostgresConnection';
import { LoggerService } from '@src/domain/services/Logger';
import { DomainValidationError } from '@src/infrastructure/shared/utils/errors/domain';

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
   * Record a modification for a specific table
   * @param userId - Clerk user ID
   * @param tableName - Name of the table that was modified
   * @param status - Status of the modification (pending, reviewed)
   */
  async recordModification(
    userId: string,
    tableName: string,
    status: 'pending' | 'reviewed' = 'pending'
  ): Promise<void> {
    try {
      this.logger.info(
        `Recording modification for table: ${tableName}, user: ${userId}, status: ${status}`,
        PgCompanyModificationDatasourceImp.name
      );

      await this.postgresConnection.transaction(async client => {
        // First, get the user's schema
        const schemaResult = await client.query(
          `
            SELECT brand_schema 
            FROM public.user_brand_mapping
            WHERE clerk_user_id = $1 
            AND status = 'active' 
            AND deleted_at IS NULL
          `,
          [userId]
        );

        if (schemaResult.rows.length === 0) {
          throw new DomainValidationError('User not found in any brand schema');
        }

        const schemaName = schemaResult.rows[0].brand_schema;

        // Create new modification request
        const insertResult = await client.query(
          `
            INSERT INTO public.modification_requests (
              schema_name, table_name, status
            ) VALUES ($1, $2, $3)
            RETURNING id
          `,
          [schemaName, tableName, status]
        );

        const modificationRequestId = insertResult.rows[0].id;

        this.logger.info(
          `Created new modification request for schema: ${schemaName}, table: ${tableName}`,
          PgCompanyModificationDatasourceImp.name
        );

        // Create new company_modifications record
        await client.query(
          `
            INSERT INTO public.company_modifications (
              modification_request_id
            ) VALUES ($1)
          `,
          [modificationRequestId]
        );

        this.logger.info(
          `Created new company modification record for request: ${modificationRequestId}`,
          PgCompanyModificationDatasourceImp.name
        );
      });

      this.logger.info(
        `Modification recorded successfully for table: ${tableName}`,
        PgCompanyModificationDatasourceImp.name
      );
    } catch (error) {
      this.logger.error(
        `Failed to record modification for table: ${tableName}, Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        PgCompanyModificationDatasourceImp.name
      );
      throw error;
    }
  }
}
