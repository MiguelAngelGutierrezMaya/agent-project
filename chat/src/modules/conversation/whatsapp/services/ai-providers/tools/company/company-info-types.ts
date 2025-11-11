/**
 * Company information interface
 *
 * @description
 * Represents company information extracted from the configuration.
 * Contains contact details, social media, and flexible additional information.
 */
export interface CompanyInfo {
  /** Company/bot name */
  name: string;
  /** WhatsApp display phone number */
  whatsappPhone?: string;
  /** Facebook page URL */
  facebookPage?: string;
  /** Instagram page URL */
  instagramPage?: string;
  /** Additional flexible company information from JSON */
  [key: string]:
    | string
    | boolean
    | number
    | undefined
    | Date
    | string[]
    | boolean[]
    | number[]
    | Date[]
    | Record<string, unknown>
    | Record<string, unknown>[];
}

/**
 * Database row type for company info query
 *
 * @description
 * Represents a single row from a database query that gets
 * company information from the config and options_config tables.
 */
export type CompanyInfoRow = {
  bot_name: string;
  company_information: Record<string, unknown>; // JSONB field from options_config
  whatsapp_display_phone?: string;
  facebook_page_url?: string;
  instagram_page_url?: string;
};
