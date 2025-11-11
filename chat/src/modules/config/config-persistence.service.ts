import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DatabaseConnectionService } from '@shared/persistence/mongo/database-connection.service';
import {
  ClientConfig,
  type ClientConfigDocument,
} from '@shared/persistence/mongo/schemas/client-config.schema';
import type { ConfigWithSchema } from './domain/models/config.model';
import { TENANT_CONFIG_COLLECTION } from './utils/collection-names.constants';

/**
 * Service for persisting client configuration in MongoDB.
 *
 * This service handles the dual-database strategy:
 * 1. Stores all client configurations in the public database (client_configs collection)
 * 2. Stores individual client configuration in their respective tenant database
 *
 * @class ConfigPersistenceService
 */
@Injectable()
export class ConfigPersistenceService {
  private readonly logger = new Logger(ConfigPersistenceService.name);

  constructor(
    @InjectModel(ClientConfig.name)
    private readonly clientConfigModel: Model<ClientConfigDocument>,
    private readonly dbConnectionService: DatabaseConnectionService
  ) {}

  /**
   * Persists client configuration to both public and tenant databases.
   *
   * @param config - The client configuration with schema information
   * @returns Promise that resolves when both operations complete
   *
   * @description
   * This method performs two operations:
   * 1. Upserts the configuration in the public database (client_configs collection)
   * 2. Creates/updates the tenant database and stores the config there
   */
  async saveClientConfig(config: ConfigWithSchema): Promise<void> {
    this.logger.log(
      `Saving client config - ID: ${config.id}, Schema: ${config.schema}`
    );

    try {
      /* Step 1: Save to public database */
      await this.saveToPublicDatabase(config);

      /* Step 2: Save to tenant database */
      await this.saveToTenantDatabase(config);

      this.logger.log(
        `✓ Successfully saved config for client ${config.id} in both databases`
      );
    } catch (error) {
      this.logger.error(
        `Failed to save config for client ${config.id}`,
        error instanceof Error ? error.stack : String(error)
      );
      throw error;
    }
  }

  /**
   * Saves or updates the client configuration in the public database.
   *
   * @param config - The client configuration
   * @returns Promise that resolves to the saved document
   *
   * @description
   * Uses upsert to either create a new document or update an existing one.
   * The public database serves as a global registry of all client configurations.
   */
  private async saveToPublicDatabase(
    config: ConfigWithSchema
  ): Promise<ClientConfigDocument> {
    this.logger.debug(
      `Saving to public database - client_configs collection - ID: ${config.id}`
    );

    try {
      const result = await this.clientConfigModel.findOneAndUpdate(
        { id: config.id }, // Query by client ID
        {
          $set: {
            id: config.id,
            botName: config.botName,
            'optionsConfig.id': config.optionsConfig.id,
            'optionsConfig.configData': config.optionsConfig.configData,
            'optionsConfig.companyInformation':
              config.optionsConfig.companyInformation,
            'optionsConfig.createdAt': config.optionsConfig.createdAt,
            'optionsConfig.updatedAt': config.optionsConfig.updatedAt,
            socialConfig: {
              id: config.socialConfig.id,
              whatsappNumber: config.socialConfig.whatsappNumber,
              whatsappAccessToken: config.socialConfig.whatsappAccessToken,
              whatsappBusinessPhoneId:
                config.socialConfig.whatsappBusinessPhoneId,
              whatsappDisplayPhone: config.socialConfig.whatsappDisplayPhone,
              facebookEndpoint: config.socialConfig.facebookEndpoint,
              whatsappApiVersion: config.socialConfig.whatsappApiVersion,
              facebookPageUrl: config.socialConfig.facebookPageUrl,
              instagramPageUrl: config.socialConfig.instagramPageUrl,
              whatsappListDescription:
                config.socialConfig.whatsappListDescription,
              whatsappButtonOptionsTitle:
                config.socialConfig.whatsappButtonOptionsTitle,
              createdAt: config.socialConfig.createdAt,
              updatedAt: config.socialConfig.updatedAt,
            },
            aiConfig: {
              id: config.aiConfig.id,
              chatModel: config.aiConfig.chatModel,
              embeddingModel: config.aiConfig.embeddingModel,
              temperature: config.aiConfig.temperature,
              maxTokens: config.aiConfig.maxTokens,
              createdAt: config.aiConfig.createdAt,
              updatedAt: config.aiConfig.updatedAt,
            },
            billing: {
              currency: config.billing.currency,
              amount: config.billing.amount,
              status: config.billing.status,
              createdAt: config.billing.createdAt,
              updatedAt: config.billing.updatedAt,
            },
            schema: config.schema,
            createdAt: config.createdAt,
            updatedAt: config.updatedAt,
          },
        },
        {
          upsert: true, // Create if doesn't exist, update if exists
          new: true, // Return the updated document
          runValidators: true, // Run schema validators
        }
      );

      this.logger.debug(
        `✓ Saved to public database - ID: ${config.id}, Schema: ${config.schema}`
      );

      return result;
    } catch (error) {
      this.logger.error(
        `Failed to save to public database - ID: ${config.id}`,
        error instanceof Error ? error.stack : String(error)
      );
      throw error;
    }
  }

  /**
   * Saves or updates the client configuration in the tenant-specific database.
   *
   * @param config - The client configuration with schema information
   * @returns Promise that resolves when the operation completes
   *
   * @description
   * This method:
   * 1. Gets or creates a connection to the tenant database
   * 2. Ensures the config collection exists
   * 3. Upserts the configuration document (only one document per tenant)
   */
  private async saveToTenantDatabase(config: ConfigWithSchema): Promise<void> {
    this.logger.debug(
      `Saving to tenant database - Schema: ${config.schema}, ID: ${config.id}`
    );

    try {
      /* Get connection to tenant database (creates if doesn't exist) */
      const tenantDb = this.dbConnectionService.getDatabase(config.schema);

      /* Get the config collection */
      const configCollection = tenantDb.collection(TENANT_CONFIG_COLLECTION);

      /* Upsert configuration (only one document per tenant) */
      const result = await configCollection.updateOne(
        { id: config.id }, // Query by client ID
        {
          $set: {
            id: config.id,
            botName: config.botName,
            optionsConfig: config.optionsConfig,
            socialConfig: config.socialConfig,
            aiConfig: config.aiConfig,
            billing: config.billing,
            schema: config.schema,
            createdAt: config.createdAt,
            updatedAt: config.updatedAt,
          },
        },
        {
          upsert: true, // Create if doesn't exist
        }
      );

      if (result.upsertedCount > 0) {
        this.logger.debug(
          `✓ Created new config in tenant database - Schema: ${config.schema}`
        );
      } else if (result.modifiedCount > 0) {
        this.logger.debug(
          `✓ Updated existing config in tenant database - Schema: ${config.schema}`
        );
      } else {
        this.logger.debug(
          `○ No changes needed in tenant database - Schema: ${config.schema}`
        );
      }
    } catch (error) {
      this.logger.error(
        `Failed to save to tenant database - Schema: ${config.schema}`,
        error instanceof Error ? error.stack : String(error)
      );
      throw error;
    }
  }

  /**
   * Retrieves a client configuration from the public database.
   *
   * @param clientId - The client identifier
   * @returns Promise that resolves to the client configuration or null if not found
   */
  async getClientConfig(
    clientId: string
  ): Promise<ClientConfigDocument | null> {
    this.logger.debug(
      `Fetching client config from public database: ${clientId}`
    );

    try {
      const config = await this.clientConfigModel.findOne({ id: clientId });

      if (config) {
        this.logger.debug(`✓ Found config for client: ${clientId}`);
      } else {
        this.logger.debug(`○ No config found for client: ${clientId}`);
      }

      return config;
    } catch (error) {
      this.logger.error(
        `Failed to fetch config for client: ${clientId}`,
        error instanceof Error ? error.stack : String(error)
      );
      throw error;
    }
  }

  /**
   * Retrieves a client configuration from the tenant database.
   *
   * @param schema - The tenant schema/database name
   * @param clientId - The client identifier
   * @returns Promise that resolves to the configuration or null if not found
   */
  async getTenantConfig(
    schema: string,
    clientId: string
  ): Promise<Record<string, unknown> | null> {
    this.logger.debug(
      `Fetching config from tenant database - Schema: ${schema}, ID: ${clientId}`
    );

    try {
      const tenantDb = this.dbConnectionService.getDatabase(schema);
      const configCollection = tenantDb.collection(TENANT_CONFIG_COLLECTION);

      const config = await configCollection.findOne({ id: clientId });

      if (config) {
        this.logger.debug(
          `✓ Found config in tenant database - Schema: ${schema}`
        );
      } else {
        this.logger.debug(
          `○ No config found in tenant database - Schema: ${schema}`
        );
      }

      return config as Record<string, unknown> | null;
    } catch (error) {
      this.logger.error(
        `Failed to fetch config from tenant database - Schema: ${schema}`,
        error instanceof Error ? error.stack : String(error)
      );
      throw error;
    }
  }

  /**
   * Deletes a client configuration from both databases.
   *
   * @param clientId - The client identifier
   * @param schema - The tenant schema/database name
   * @returns Promise that resolves when both operations complete
   */
  async deleteClientConfig(clientId: string, schema: string): Promise<void> {
    this.logger.log(
      `Deleting client config - ID: ${clientId}, Schema: ${schema}`
    );

    try {
      /* Delete from public database */
      await this.clientConfigModel.deleteOne({ id: clientId });
      this.logger.debug(`✓ Deleted from public database - ID: ${clientId}`);

      /* Delete from tenant database */
      const tenantDb = this.dbConnectionService.getDatabase(schema);
      const configCollection = tenantDb.collection(TENANT_CONFIG_COLLECTION);
      await configCollection.deleteOne({ id: clientId });
      this.logger.debug(`✓ Deleted from tenant database - Schema: ${schema}`);

      this.logger.log(
        `✓ Successfully deleted config for client ${clientId} from both databases`
      );
    } catch (error) {
      this.logger.error(
        `Failed to delete config for client ${clientId}`,
        error instanceof Error ? error.stack : String(error)
      );
      throw error;
    }
  }
}
