import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

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
 * Billing subdocument schema.
 */
@Schema({ _id: false, timestamps: true })
export class Billing {
  @Prop({ required: true, enum: Object.values(BillingCurrency) })
  currency: string;

  @Prop({ required: true, type: Number })
  amount: number;

  @Prop({ required: true, enum: Object.values(BillingStatus) })
  status: string;

  @Prop({ type: Date })
  createdAt: Date;

  @Prop({ type: Date })
  updatedAt: Date;
}

/**
 * Options configuration subdocument schema with flexible JSON fields.
 */
@Schema({ _id: false, timestamps: true })
export class OptionsConfig {
  @Prop({ required: true })
  id: string;

  @Prop({ required: true, type: Object })
  configData: Record<string, unknown>;

  @Prop({ required: true, type: Object })
  companyInformation: Record<string, unknown>;

  @Prop({ type: Date })
  createdAt: Date;

  @Prop({ type: Date })
  updatedAt: Date;
}

/**
 * Social media and WhatsApp Business API configuration subdocument schema.
 */
@Schema({ _id: false, timestamps: true })
export class SocialConfig {
  @Prop({ required: true })
  id: string;

  @Prop({ required: true })
  whatsappNumber: string;

  @Prop({ required: true })
  whatsappAccessToken: string;

  @Prop({ required: true })
  whatsappBusinessPhoneId: string;

  @Prop({ required: true })
  whatsappDisplayPhone: string;

  @Prop({ required: true })
  facebookEndpoint: string;

  @Prop({ required: true })
  whatsappApiVersion: string;

  @Prop({ required: true })
  facebookPageUrl: string;

  @Prop({ required: true })
  instagramPageUrl: string;

  @Prop({ required: true })
  whatsappListDescription: string;

  @Prop({ required: true })
  whatsappButtonOptionsTitle: string;

  @Prop({ type: Date })
  createdAt: Date;

  @Prop({ type: Date })
  updatedAt: Date;
}

/**
 * AI model configuration subdocument schema.
 */
@Schema({ _id: false, timestamps: true })
export class AiConfig {
  @Prop({ required: true })
  id: string;

  @Prop({ required: true })
  chatModel: string;

  @Prop({ required: true })
  embeddingModel: string;

  @Prop({ required: true, type: Number })
  temperature: number;

  @Prop({ required: true, type: Number })
  maxTokens: number;

  @Prop({ type: Date })
  createdAt: Date;

  @Prop({ type: Date })
  updatedAt: Date;
}

/**
 * Client configuration document type.
 */
export type ClientConfigDocument = ClientConfig & Document;

/**
 * Client configuration schema for the public database.
 *
 * This schema stores the global configuration for each client/tenant,
 * including their database schema information for multi-tenant support.
 *
 * The configuration includes:
 * - Bot settings (name)
 * - Options configuration (flexible JSON fields)
 * - Social media configuration (WhatsApp Business API)
 * - AI model configuration (chat model, embeddings, temperature, tokens)
 * - Billing information
 * - Database schema mapping
 *
 * @class ClientConfig
 */
@Schema({ collection: 'client_configs', timestamps: true })
export class ClientConfig {
  @Prop({ required: true })
  id: string;

  @Prop({ required: true })
  botName: string;

  @Prop({ required: true, type: OptionsConfig })
  optionsConfig: OptionsConfig;

  @Prop({ required: true, type: SocialConfig })
  socialConfig: SocialConfig;

  @Prop({ required: true, type: AiConfig })
  aiConfig: AiConfig;

  @Prop({ required: true, type: Billing })
  billing: Billing;

  @Prop({ required: true })
  schema: string;

  @Prop({ type: Date })
  createdAt: Date;

  @Prop({ type: Date })
  updatedAt: Date;
}

/**
 * Mongoose schema factory for ClientConfig.
 */
export const ClientConfigSchema = SchemaFactory.createForClass(ClientConfig);

/**
 * Note: Indexes are managed by the migration system in database/mongo/
 *
 * @description
 * This schema only defines the data structure. Indexes are created and managed
 * by the centralized migration system to ensure consistency and proper versioning.
 *
 * See: database/mongo/migrations/config/ for index definitions.
 */
