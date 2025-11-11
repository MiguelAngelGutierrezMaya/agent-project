import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  ClientConfig,
  type ClientConfigDocument,
} from '@shared/persistence/mongo/schemas/client-config.schema';
import { ServiceError } from '@src/shared/utils/errors/services';
import type { ConfigWithSchema } from '@src/modules/config/domain/models/config.model';

/**
 * Service to resolve client configuration from WhatsApp phone number
 *
 * @description
 * This service queries the public database to find the complete client configuration
 * based on their WhatsApp Business phone number.
 * Returns the full configuration including AI, social, and billing settings.
 */
@Injectable()
export class ClientSchemaResolverService {
  private readonly logger = new Logger(ClientSchemaResolverService.name);

  constructor(
    @InjectModel(ClientConfig.name)
    private readonly clientConfigModel: Model<ClientConfigDocument>
  ) {}

  /**
   * Get complete client configuration from WhatsApp phone number
   *
   * @param whatsappNumber WhatsApp Business phone number from webhook metadata
   * @returns ConfigWithSchema object containing all client configuration
   * @throws ServiceError if client not found or missing required configuration
   *
   * @description
   * Queries the public database (client_configs collection) to find the complete client
   * configuration that matches the provided WhatsApp number.
   * The WhatsApp number is stored in socialConfig.whatsappDisplayPhone field.
   * Returns all configuration including:
   * - Bot settings (name, messages, URLs)
   * - Social config (WhatsApp Business API)
   * - AI config (models, temperature, tokens)
   * - Options config (products, support, website)
   * - Billing information
   * - Database schema for multi-tenant support
   *
   * @example
   * const config = await resolverService.getClientConfigByWhatsappNumber('+15556433120');
   * // Returns: {
   * //   id: 'uuid-123',
   * //   schema: 'client_acme_corp',
   * //   socialConfig: { whatsappAccessToken: '...', ... },
   * //   aiConfig: { chatModel: 'gpt-4', ... },
   * //   ...
   * // }
   */
  async getClientConfigByWhatsappNumber(
    whatsappNumber: string
  ): Promise<ConfigWithSchema> {
    this.logger.log(
      `Searching client configuration for WhatsApp number: ${whatsappNumber}`,
      ClientSchemaResolverService.name
    );

    try {
      const clientConfig = await this.clientConfigModel
        .findOne({
          'socialConfig.whatsappDisplayPhone': whatsappNumber,
        })
        .lean()
        .exec();

      if (!clientConfig) {
        this.logger.warn(
          `No client found for WhatsApp number: ${whatsappNumber}`,
          ClientSchemaResolverService.name
        );
        throw new ServiceError(
          `Client not found for WhatsApp number: ${whatsappNumber}`
        );
      }

      /* Validate that required configurations exist */
      const missingConfigs: string[] = [];
      if (!clientConfig.socialConfig) missingConfigs.push('socialConfig');
      if (!clientConfig.aiConfig) missingConfigs.push('aiConfig');
      if (!clientConfig.optionsConfig) missingConfigs.push('optionsConfig');
      if (!clientConfig.schema) missingConfigs.push('schema');

      if (missingConfigs.length > 0) {
        throw new ServiceError(
          `Client configuration incomplete for ${clientConfig.id as string}. Missing: ${missingConfigs.join(', ')}`
        );
      }

      /* Validate required WhatsApp fields in social config */
      const socialConfig = clientConfig.socialConfig;
      const missingWhatsappFields: string[] = [];
      if (!socialConfig.whatsappAccessToken)
        missingWhatsappFields.push('whatsappAccessToken');
      if (!socialConfig.whatsappBusinessPhoneId)
        missingWhatsappFields.push('whatsappBusinessPhoneId');
      if (!socialConfig.whatsappDisplayPhone)
        missingWhatsappFields.push('whatsappDisplayPhone');
      if (!socialConfig.facebookEndpoint)
        missingWhatsappFields.push('facebookEndpoint');
      if (!socialConfig.whatsappApiVersion)
        missingWhatsappFields.push('whatsappApiVersion');
      if (!socialConfig.whatsappListDescription)
        missingWhatsappFields.push('whatsappListDescription');
      if (!socialConfig.whatsappButtonOptionsTitle)
        missingWhatsappFields.push('whatsappButtonOptionsTitle');

      if (missingWhatsappFields.length > 0) {
        throw new ServiceError(
          `WhatsApp configuration incomplete for client ${clientConfig.id as string}. Missing fields: ${missingWhatsappFields.join(', ')}`
        );
      }

      /* Validate required AI config fields */
      const aiConfig = clientConfig.aiConfig;
      const missingAiFields: string[] = [];
      if (!aiConfig.chatModel) missingAiFields.push('chatModel');
      if (!aiConfig.embeddingModel) missingAiFields.push('embeddingModel');
      if (aiConfig.temperature === undefined)
        missingAiFields.push('temperature');
      if (aiConfig.maxTokens === undefined) missingAiFields.push('maxTokens');

      if (missingAiFields.length > 0) {
        throw new ServiceError(
          `AI configuration incomplete for client ${clientConfig.id as string}. Missing fields: ${missingAiFields.join(', ')}`
        );
      }

      this.logger.log(
        `Found client - Schema: ${clientConfig.schema}, ID: ${clientConfig.id}, Phone: ${socialConfig.whatsappDisplayPhone}`,
        ClientSchemaResolverService.name
      );

      /* Return complete configuration - Pass optionsConfig directly like other configs */
      return {
        id: String(clientConfig.id),
        schema: String(clientConfig.schema),
        botName: String(clientConfig.botName),
        createdAt: new Date(clientConfig.createdAt),
        updatedAt: new Date(clientConfig.updatedAt),
        optionsConfig: clientConfig.optionsConfig,
        socialConfig: clientConfig.socialConfig,
        aiConfig: clientConfig.aiConfig,
        billing: clientConfig.billing,
      } as ConfigWithSchema;
    } catch (error) {
      if (error instanceof ServiceError) {
        throw error;
      }

      this.logger.error(
        `Error resolving client configuration for WhatsApp number: ${whatsappNumber}`,
        error instanceof Error ? error.stack : String(error)
      );

      throw new ServiceError(
        `Failed to resolve client configuration: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }
}
