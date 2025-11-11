/**
 * Bot Configuration for UI
 * Simplified view model based on backend Config model
 */
export interface BotConfiguration {
  /** Bot name */
  botName: string;

  /** Company information fields (dynamic dictionary) */
  companyInformation: Record<string, string>;

  /** WhatsApp configuration */
  whatsappNumber: string;
  whatsappAccessToken: string;
  whatsappBusinessPhoneId: string;
  whatsappDisplayPhone: string;
  facebookEndpoint: string;
  whatsappApiVersion: string;
  facebookPageUrl: string;
  instagramPageUrl: string;
  whatsappListDescription: string;
  whatsappButtonOptionsTitle: string;

  /** AI Configuration */
  chatModel: string;
  embeddingModel: string;
  temperature: number;
  maxTokens: number;
  batchEmbedding: boolean;
}

export interface ConfigurationTabProps {
  config: BotConfiguration;
  setConfig: React.Dispatch<React.SetStateAction<BotConfiguration>>;
  errors: Record<string, string>;
}
