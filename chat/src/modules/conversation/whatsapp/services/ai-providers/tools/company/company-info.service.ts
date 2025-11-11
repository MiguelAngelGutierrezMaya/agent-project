import { Injectable, Logger } from '@nestjs/common';
import { PostgresConnectionService } from '@src/shared/persistence/postgresql/postgres-connection.service';
import { CompanyInfo, CompanyInfoRow } from './company-info-types';

/**
 * Company Info Service
 *
 * @description
 * Injectable NestJS service for retrieving company information
 * from the configuration tables. Provides contact details, social media,
 * and flexible company-specific information for the bot to respond to user inquiries.
 *
 * Features:
 * - Get company information from config, options_config, and social_config tables
 * - Supports multi-tenant schema switching
 * - Returns structured company data with flexible JSON fields
 * - Handles missing information gracefully
 */
@Injectable()
export class CompanyInfoService {
  private readonly logger = new Logger(CompanyInfoService.name);

  constructor(private readonly postgresConnection: PostgresConnectionService) {}

  /**
   * Get company information
   *
   * @param schema Client's database schema (for multi-tenancy)
   * @returns Company information or null if not found
   *
   * @description
   * Gets company information from the configuration tables.
   * Queries PostgreSQL database directly using the schema for multi-tenancy.
   *
   * SQL Query:
   * - Sets search path to tenant schema
   * - Gets config with options_config and social_config information
   * - Excludes deleted records
   * - Returns most recent configuration
   * - Extracts flexible company information from JSON fields
   */
  async getCompanyInfo(schema: string): Promise<CompanyInfo | null> {
    try {
      this.logger.log(`Getting company info - Schema: ${schema}`);

      const result = await this.postgresConnection.transaction(async client => {
        // Set schema context for multi-tenancy
        await client.query(this.postgresConnection.getSchemaQuery(schema));

        // Query for company information from config, options_config, and social_config
        const query = `
          SELECT 
            c.bot_name,
            oc.company_information,
            sc.whatsapp_display_phone,
            sc.facebook_page_url,
            sc.instagram_page_url
          FROM config c
          LEFT JOIN options_config oc ON c.options_config_uuid = oc.id AND oc.deleted_at IS NULL
          LEFT JOIN social_config sc ON c.social_config_uuid = sc.id AND sc.deleted_at IS NULL
          WHERE c.deleted_at IS NULL
          ORDER BY c.created_at DESC, c.updated_at DESC
          LIMIT 1
        `;

        // Execute the query
        const configResult = await client.query(query);

        if (configResult.rows.length === 0) {
          return null;
        }

        // Transform database row to CompanyInfo model
        const companyInfo = this.transformRowToCompanyInfo(
          configResult.rows[0] as CompanyInfoRow
        );

        return companyInfo;
      });

      if (result) {
        this.logger.debug(
          `Company info found - Schema: ${schema}, Name: ${result.name}`
        );
      } else {
        this.logger.debug(`Company info not found - Schema: ${schema}`);
      }

      return result;
    } catch (error) {
      this.logger.error(
        `Company info error: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined
      );
      return null;
    }
  }

  /**
   * Transform database row to CompanyInfo model
   *
   * @param row Database query result row
   * @returns CompanyInfo model
   * @private
   */
  private transformRowToCompanyInfo(row: CompanyInfoRow): CompanyInfo {
    const companyInfo = row.company_information || {};

    // Create base company info with known fields
    const result: CompanyInfo = {
      name: row.bot_name,
      whatsappPhone: row.whatsapp_display_phone || undefined,
      facebookPage: row.facebook_page_url || undefined,
      instagramPage: row.instagram_page_url || undefined,
    };

    // Add all fields from the JSON configuration
    Object.keys(companyInfo).forEach(key => {
      if (companyInfo[key] !== null && companyInfo[key] !== undefined) {
        result[key] = companyInfo[key] as CompanyInfo[keyof CompanyInfo];
      }
    });

    return result;
  }
}
