/**
 * Social media and WhatsApp Business API configuration
 */
export interface SocialConfig {
  /** Unique social config identifier */
  id: string;

  /** WhatsApp number for display/reference */
  whatsappNumber: string;

  /** WhatsApp Business API access token */
  whatsappAccessToken: string;

  /** WhatsApp Business Phone Number ID from Meta */
  whatsappBusinessPhoneId: string;

  /** WhatsApp display phone number (e.g., +15551234567) */
  whatsappDisplayPhone: string;

  /** Facebook Graph API endpoint URL */
  facebookEndpoint: string;

  /** WhatsApp Business API version (e.g., v21.0, v22.0) */
  whatsappApiVersion: string;

  /** Facebook page URL */
  facebookPageUrl: string;

  /** Instagram page URL */
  instagramPageUrl: string;

  /** Custom description text for WhatsApp interactive product lists */
  whatsappListDescription: string;

  /** Custom button title for WhatsApp interactive lists (e.g., "Ver opciones", "Ver productos") */
  whatsappButtonOptionsTitle: string;

  /** Configuration creation timestamp */
  createdAt: Date;

  /** Configuration last update timestamp */
  updatedAt: Date;
}
