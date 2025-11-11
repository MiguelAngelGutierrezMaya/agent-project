import type { ConfigWithSchema } from '@/modules/Config/domain/models/Config';
import type { BotConfiguration } from '@/modules/Config/presentation/components/types';

/**
 * Transform backend ConfigWithSchema to UI BotConfiguration
 * @param backendConfig - Backend configuration model
 * @returns UI configuration model
 */
export function transformBackendToUI(
  backendConfig: ConfigWithSchema
): BotConfiguration {
  return {
    botName: backendConfig.botName,
    companyInformation: (backendConfig.optionsConfig.companyInformation ||
      {}) as Record<string, string>,
    whatsappNumber: backendConfig.socialConfig.whatsappNumber,
    whatsappAccessToken: backendConfig.socialConfig.whatsappAccessToken,
    whatsappBusinessPhoneId: backendConfig.socialConfig.whatsappBusinessPhoneId,
    whatsappDisplayPhone: backendConfig.socialConfig.whatsappDisplayPhone,
    facebookEndpoint: backendConfig.socialConfig.facebookEndpoint,
    whatsappApiVersion: backendConfig.socialConfig.whatsappApiVersion,
    facebookPageUrl: backendConfig.socialConfig.facebookPageUrl,
    instagramPageUrl: backendConfig.socialConfig.instagramPageUrl,
    whatsappListDescription: backendConfig.socialConfig.whatsappListDescription,
    whatsappButtonOptionsTitle:
      backendConfig.socialConfig.whatsappButtonOptionsTitle,
    chatModel: backendConfig.aiConfig.chatModel,
    embeddingModel: backendConfig.aiConfig.embeddingModel,
    temperature: backendConfig.aiConfig.temperature,
    maxTokens: backendConfig.aiConfig.maxTokens,
    batchEmbedding: backendConfig.aiConfig.batchEmbedding,
  };
}

/**
 * Transform UI BotConfiguration to backend Config
 * @param uiConfig - UI configuration model
 * @param originalConfig - Original backend configuration to preserve metadata
 * @returns Backend configuration model
 */
export function transformUIToBackend(
  uiConfig: BotConfiguration,
  originalConfig: ConfigWithSchema
): ConfigWithSchema {
  return {
    ...originalConfig,
    botName: uiConfig.botName,
    updatedAt: new Date(),
    optionsConfig: {
      ...originalConfig.optionsConfig,
      companyInformation: uiConfig.companyInformation,
      updatedAt: new Date(),
    },
    socialConfig: {
      ...originalConfig.socialConfig,
      whatsappNumber: uiConfig.whatsappNumber,
      whatsappAccessToken: uiConfig.whatsappAccessToken,
      whatsappBusinessPhoneId: uiConfig.whatsappBusinessPhoneId,
      whatsappDisplayPhone: uiConfig.whatsappDisplayPhone,
      facebookEndpoint: uiConfig.facebookEndpoint,
      whatsappApiVersion: uiConfig.whatsappApiVersion,
      facebookPageUrl: uiConfig.facebookPageUrl,
      instagramPageUrl: uiConfig.instagramPageUrl,
      whatsappListDescription: uiConfig.whatsappListDescription,
      whatsappButtonOptionsTitle: uiConfig.whatsappButtonOptionsTitle,
      updatedAt: new Date(),
    },
    aiConfig: {
      ...originalConfig.aiConfig,
      chatModel: uiConfig.chatModel,
      embeddingModel: uiConfig.embeddingModel,
      temperature: uiConfig.temperature,
      maxTokens: uiConfig.maxTokens,
      batchEmbedding: uiConfig.batchEmbedding,
      updatedAt: new Date(),
    },
  };
}
