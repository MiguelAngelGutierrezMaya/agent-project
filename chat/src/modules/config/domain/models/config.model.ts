/**
 * Billing status enumeration.
 */
export enum BillingStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
}

/**
 * Billing currency enumeration.
 */
export enum BillingCurrency {
  USD = 'USD',
  COP = 'COP',
}

/**
 * Billing information interface.
 */
export interface Billing {
  currency: BillingCurrency;
  amount: number;
  status: BillingStatus;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Options configuration interface with flexible JSON fields.
 */
export interface OptionsConfig {
  id: string;
  configData: Record<string, unknown>;
  companyInformation: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Social media and WhatsApp Business API configuration interface.
 */
export interface SocialConfig {
  id: string;
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
  createdAt: Date;
  updatedAt: Date;
}

/**
 * AI model configuration interface.
 */
export interface AiConfig {
  id: string;
  chatModel: string;
  embeddingModel: string;
  temperature: number;
  maxTokens: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Base configuration data interface containing all bot configuration properties.
 */
export interface ConfigData {
  /** Name of the bot */
  botName: string;
  /** Configuration creation timestamp */
  createdAt: Date;
  /** Configuration last update timestamp */
  updatedAt: Date;
  /** Bot options configuration */
  optionsConfig: OptionsConfig;
  /** Social media configuration */
  socialConfig: SocialConfig;
  /** AI model configuration */
  aiConfig: AiConfig;
  /** Billing configuration */
  billing: Billing;
}

/**
 * Complete configuration interface including unique identifier.
 *
 * This interface represents the structure of a configuration entity
 * that can be stored and managed in the system.
 *
 * @interface Config
 */
export interface Config extends ConfigData {
  /** Unique configuration identifier */
  id: string;
}

/**
 * Configuration interface with database schema information.
 * Used for multi-tenant configurations.
 *
 * This is the main interface used in the chat service to identify
 * which database schema a client's data belongs to.
 *
 * @interface ConfigWithSchema
 */
export interface ConfigWithSchema extends Config {
  /** Database schema for multi-tenant support */
  schema: string;
}
