import type { AiConfig } from '@/modules/Config/domain/models/AiConfig';
import type { Billing } from '@/modules/Config/domain/models/Billing';
import type { OptionsConfig } from '@/modules/Config/domain/models/OptionsConfig';
import type { SocialConfig } from '@/modules/Config/domain/models/SocialConfig';

/**
 * Base configuration data interface containing all bot configuration properties
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
 * Complete configuration interface including unique identifier
 */
export interface Config extends ConfigData {
  /** Unique configuration identifier */
  id: string;
}

/**
 * Configuration interface with database schema information
 * Used for multi-tenant configurations
 */
export interface ConfigWithSchema extends Config {
  /** Database schema for multi-tenant support */
  schema: string;
}
