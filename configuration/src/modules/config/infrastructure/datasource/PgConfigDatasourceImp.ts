import { ConfigDatasource } from '@modules/config/domain/datasource/ConfigDatasource';
import { Config, ConfigWithSchema } from '@modules/config/domain/models/Config';
import {
  BillingCurrency,
  BillingStatus,
} from '@modules/config/domain/models/Billing';
import { PostgresConnection } from '@src/infrastructure/shared/persistence/postgresql/PostgresConnection';
import { LoggerService } from '@src/domain/services/Logger';
import { DataNotFoundError } from '@src/infrastructure/shared/utils/errors/domain';
import { ConfigDTO } from '@modules/config/domain/dto/ConfigDTO';

export class PgConfigDatasourceImp implements ConfigDatasource {
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
   * @description This query is used to set the schema context for a specific user
   * finding the user in the user_brand_mapping table and setting the schema context
   */
  private getSchemaQuery(clerkUserId: string): string {
    // Escape single quotes in clerkUserId to prevent SQL injection
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

  /**
   * Get configuration for a specific user
   * @param clerkUserId - Clerk user ID
   * @returns Promise<Config> - User configuration
   */
  async getConfig(clerkUserId: string): Promise<ConfigWithSchema> {
    try {
      this.logger.info(
        'Fetching configuration for user',
        PgConfigDatasourceImp.name
      );

      const result = await this.postgresConnection.transaction(async client => {
        await client.query(this.getSchemaQuery(clerkUserId));

        // Get the most recent config with all related data and user schema
        const configResult = await client.query(
          `
          SELECT 
            c.id as config_id,
            c.bot_name,
            c.created_at as config_created_at,
            c.updated_at as config_updated_at,
            
            -- Social config data
            sc.id as social_config_id,
            sc.whatsapp_number,
            sc.whatsapp_access_token,
            sc.whatsapp_business_phone_id,
            sc.whatsapp_display_phone,
            sc.facebook_endpoint,
            sc.whatsapp_api_version,
            sc.facebook_page_url,
            sc.instagram_page_url,
            sc.whatsapp_list_description,
            sc.whatsapp_button_options_title,
            sc.created_at as social_config_created_at,
            sc.updated_at as social_config_updated_at,
            
            -- Options config data (JSON fields)
            oc.id as options_config_id,
            oc.config_data,
            oc.company_information,
            oc.created_at as options_config_created_at,
            oc.updated_at as options_config_updated_at,
            
            -- AI config data
            ai.id as ai_config_id,
            ai.chat_model,
            ai.embedding_model,
            ai.temperature,
            ai.batch_embedding,
            ai.max_tokens,
            ai.created_at as ai_config_created_at,
            ai.updated_at as ai_config_updated_at,
            
            -- Billing data (most recent)
            b.id as billing_id,
            b.amount,
            b.currency,
            b.status as billing_status,
            b.created_at as billing_created_at,
            b.updated_at as billing_updated_at,
            
            -- User schema from user_brand_mapping
            ubm.brand_schema as user_schema
          FROM config c
          LEFT JOIN social_config sc ON c.social_config_uuid = sc.id AND sc.deleted_at IS NULL
          LEFT JOIN options_config oc ON c.options_config_uuid = oc.id AND oc.deleted_at IS NULL
          LEFT JOIN ai_config ai ON c.ai_config_uuid = ai.id AND ai.deleted_at IS NULL
          LEFT JOIN (
            SELECT *
            FROM billing
            WHERE deleted_at IS NULL
            ORDER BY created_at DESC
            LIMIT 1
          ) b ON true
          LEFT JOIN public.user_brand_mapping ubm ON ubm.clerk_user_id = $1 
            AND ubm.status = 'active' 
            AND ubm.deleted_at IS NULL
          WHERE c.deleted_at IS NULL
          ORDER BY c.created_at DESC, c.updated_at DESC
          LIMIT 1
        `,
          [clerkUserId]
        );

        return configResult;
      });

      this.logger.info(
        `Configuration fetched successfully User: ${clerkUserId}, Result: ${JSON.stringify(result)}`,
        PgConfigDatasourceImp.name
      );

      if (result.rows.length === 0) {
        throw new DataNotFoundError('No configuration found for user');
      }

      const configData = result.rows[0];

      // Map database result to Config model
      const [configDTO, error] = ConfigDTO.create({
        id: configData.config_id || '',
        botName: configData.bot_name || '',
        createdAt: new Date(configData.config_created_at),
        updatedAt: new Date(configData.config_updated_at),
        optionsConfig: {
          id: configData.options_config_id || '',
          configData: configData.config_data || {},
          companyInformation: configData.company_information || {},
          createdAt: new Date(configData.options_config_created_at),
          updatedAt: new Date(configData.options_config_updated_at),
        },
        socialConfig: {
          id: configData.social_config_id || '',
          whatsappNumber: configData.whatsapp_number || '',
          whatsappAccessToken: configData.whatsapp_access_token || '',
          whatsappBusinessPhoneId: configData.whatsapp_business_phone_id || '',
          whatsappDisplayPhone: configData.whatsapp_display_phone || '',
          facebookEndpoint: configData.facebook_endpoint || '',
          whatsappApiVersion: configData.whatsapp_api_version || '',
          facebookPageUrl: configData.facebook_page_url || '',
          instagramPageUrl: configData.instagram_page_url || '',
          whatsappListDescription: configData.whatsapp_list_description || '',
          whatsappButtonOptionsTitle:
            configData.whatsapp_button_options_title || '',
          createdAt: new Date(configData.social_config_created_at),
          updatedAt: new Date(configData.social_config_updated_at),
        },
        aiConfig: {
          id: configData.ai_config_id || '',
          chat_model: configData.chat_model || '',
          embedding_model: configData.embedding_model || '',
          temperature: parseFloat(configData.temperature),
          batch_embedding: Boolean(configData.batch_embedding),
          max_tokens: parseInt(configData.max_tokens),
          created_at: new Date(configData.ai_config_created_at),
          updated_at: new Date(configData.ai_config_updated_at),
        },
        billing: {
          currency: configData.currency as BillingCurrency,
          amount: parseFloat(configData.amount) || 0,
          status: configData.billing_status as BillingStatus,
          createdAt: new Date(configData.billing_created_at),
          updatedAt: new Date(configData.billing_updated_at),
        },
      });

      if (error) {
        throw error;
      }

      return {
        ...configDTO!.toDomain(),
        schema: configData.user_schema,
      };
    } catch (error) {
      this.logger.error(
        `Failed to fetch configuration User: ${clerkUserId}, Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        PgConfigDatasourceImp.name
      );
      throw error;
    }
  }

  /**
   * Update the configuration for a specific user
   * @param clerkUserId - Clerk user ID
   * @param updateData - Update configuration data
   * @returns Promise<ConfigWithSchema> - Updated configuration with schema information
   */
  async updateConfig(
    clerkUserId: string,
    updateData: Config
  ): Promise<ConfigWithSchema> {
    try {
      this.logger.info(
        'Updating configuration for user',
        PgConfigDatasourceImp.name
      );

      const result = await this.postgresConnection.transaction(async client => {
        // Set schema context
        await client.query(this.getSchemaQuery(clerkUserId));

        // Update config table
        await client.query(
          `
          UPDATE config 
          SET 
            bot_name = $1,
            updated_at = CURRENT_TIMESTAMP
          WHERE id = $2 AND deleted_at IS NULL
        `,
          [updateData.botName, updateData.id]
        );

        // Update social_config table
        await client.query(
          `
          UPDATE social_config 
          SET 
            whatsapp_number = $1,
            whatsapp_access_token = $2,
            whatsapp_business_phone_id = $3,
            whatsapp_display_phone = $4,
            facebook_endpoint = $5,
            whatsapp_api_version = $6,
            facebook_page_url = $7,
            instagram_page_url = $8,
            whatsapp_list_description = $9,
            whatsapp_button_options_title = $10,
            updated_at = CURRENT_TIMESTAMP
          WHERE id = $11 AND deleted_at IS NULL
        `,
          [
            updateData.socialConfig.whatsappNumber,
            updateData.socialConfig.whatsappAccessToken,
            updateData.socialConfig.whatsappBusinessPhoneId,
            updateData.socialConfig.whatsappDisplayPhone,
            updateData.socialConfig.facebookEndpoint,
            updateData.socialConfig.whatsappApiVersion,
            updateData.socialConfig.facebookPageUrl,
            updateData.socialConfig.instagramPageUrl,
            updateData.socialConfig.whatsappListDescription,
            updateData.socialConfig.whatsappButtonOptionsTitle,
            updateData.socialConfig.id,
          ]
        );

        // Update options_config table
        await client.query(
          `
          UPDATE options_config 
          SET 
            config_data = $1,
            company_information = $2,
            updated_at = CURRENT_TIMESTAMP
          WHERE id = $3 AND deleted_at IS NULL
        `,
          [
            JSON.stringify(updateData.optionsConfig.configData),
            JSON.stringify(updateData.optionsConfig.companyInformation),
            updateData.optionsConfig.id,
          ]
        );

        // Update ai_config table
        await client.query(
          `
          UPDATE ai_config 
          SET 
            chat_model = $1,
            embedding_model = $2,
            temperature = $3,
            max_tokens = $4,
            batch_embedding = $5,
            updated_at = CURRENT_TIMESTAMP
          WHERE id = $6 AND deleted_at IS NULL
        `,
          [
            updateData.aiConfig.chatModel,
            updateData.aiConfig.embeddingModel,
            updateData.aiConfig.temperature,
            updateData.aiConfig.maxTokens,
            updateData.aiConfig.batchEmbedding,
            updateData.aiConfig.id,
          ]
        );

        // Get updated configuration with schema information
        const configResult = await client.query(
          `
          SELECT 
            c.id as config_id,
            c.bot_name,
            c.created_at as config_created_at,
            c.updated_at as config_updated_at,
            
            -- Social config data
            sc.id as social_config_id,
            sc.whatsapp_number,
            sc.whatsapp_access_token,
            sc.whatsapp_business_phone_id,
            sc.whatsapp_display_phone,
            sc.facebook_endpoint,
            sc.whatsapp_api_version,
            sc.facebook_page_url,
            sc.instagram_page_url,
            sc.whatsapp_list_description,
            sc.whatsapp_button_options_title,
            sc.created_at as social_config_created_at,
            sc.updated_at as social_config_updated_at,
            
            -- Options config data (JSON fields)
            oc.id as options_config_id,
            oc.config_data,
            oc.company_information,
            oc.created_at as options_config_created_at,
            oc.updated_at as options_config_updated_at,
            
            -- AI config data
            ai.id as ai_config_id,
            ai.chat_model,
            ai.embedding_model,
            ai.temperature,
            ai.batch_embedding,
            ai.max_tokens,
            ai.created_at as ai_config_created_at,
            ai.updated_at as ai_config_updated_at,
            
            -- Billing data (most recent)
            b.id as billing_id,
            b.amount,
            b.currency,
            b.status as billing_status,
            b.created_at as billing_created_at,
            b.updated_at as billing_updated_at,
            
            -- User schema from user_brand_mapping
            ubm.brand_schema as user_schema
          FROM config c
          LEFT JOIN social_config sc ON c.social_config_uuid = sc.id AND sc.deleted_at IS NULL
          LEFT JOIN options_config oc ON c.options_config_uuid = oc.id AND oc.deleted_at IS NULL
          LEFT JOIN ai_config ai ON c.ai_config_uuid = ai.id AND ai.deleted_at IS NULL
          LEFT JOIN (
            SELECT *
            FROM billing
            WHERE deleted_at IS NULL
            ORDER BY created_at DESC
            LIMIT 1
          ) b ON true
          LEFT JOIN public.user_brand_mapping ubm ON ubm.clerk_user_id = $2
            AND ubm.status = 'active'
            AND ubm.deleted_at IS NULL
          WHERE c.id = $1 AND c.deleted_at IS NULL
          ORDER BY c.created_at DESC, c.updated_at DESC
          LIMIT 1
        `,
          [updateData.id, clerkUserId]
        );

        return configResult;
      });

      this.logger.info(
        `Configuration updated successfully for User: ${clerkUserId}`,
        PgConfigDatasourceImp.name
      );

      if (result.rows.length === 0) {
        throw new DataNotFoundError('No configuration found after update');
      }

      const configData = result.rows[0];

      const [configDTO, error] = ConfigDTO.create({
        id: configData.config_id || '',
        botName: configData.bot_name || '',
        createdAt: new Date(configData.config_created_at),
        updatedAt: new Date(configData.config_updated_at),
        optionsConfig: {
          id: configData.options_config_id || '',
          configData: configData.config_data || {},
          companyInformation: configData.company_information || {},
          createdAt: new Date(configData.options_config_created_at),
          updatedAt: new Date(configData.options_config_updated_at),
        },
        socialConfig: {
          id: configData.social_config_id || '',
          whatsappNumber: configData.whatsapp_number || '',
          whatsappAccessToken: configData.whatsapp_access_token || '',
          whatsappBusinessPhoneId: configData.whatsapp_business_phone_id || '',
          whatsappDisplayPhone: configData.whatsapp_display_phone || '',
          facebookEndpoint: configData.facebook_endpoint || '',
          whatsappApiVersion: configData.whatsapp_api_version || '',
          facebookPageUrl: configData.facebook_page_url || '',
          instagramPageUrl: configData.instagram_page_url || '',
          whatsappListDescription: configData.whatsapp_list_description || '',
          whatsappButtonOptionsTitle:
            configData.whatsapp_button_options_title || '',
          createdAt: new Date(configData.social_config_created_at),
          updatedAt: new Date(configData.social_config_updated_at),
        },
        aiConfig: {
          id: configData.ai_config_id || '',
          chat_model: configData.chat_model || '',
          embedding_model: configData.embedding_model || '',
          temperature: parseFloat(configData.temperature) || 0.3,
          batch_embedding: Boolean(configData.batch_embedding),
          max_tokens: parseInt(configData.max_tokens) || 500,
          created_at: new Date(configData.ai_config_created_at),
          updated_at: new Date(configData.ai_config_updated_at),
        },
        billing: {
          currency: configData.currency as BillingCurrency,
          amount: parseFloat(configData.amount) || 0,
          status: configData.billing_status as BillingStatus,
          createdAt: new Date(configData.billing_created_at),
          updatedAt: new Date(configData.billing_updated_at),
        },
      });

      if (error) {
        throw error;
      }

      return {
        ...configDTO!.toDomain(),
        schema: configData.user_schema,
      };
    } catch (error) {
      this.logger.error(
        `Failed to update configuration for User: ${clerkUserId}, Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        PgConfigDatasourceImp.name
      );
      throw error;
    }
  }
}
