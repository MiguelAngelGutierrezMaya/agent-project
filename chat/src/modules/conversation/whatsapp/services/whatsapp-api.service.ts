import { Injectable, Logger } from '@nestjs/common';
import { ServiceError } from '@src/shared/utils/errors/services';
import type { SocialConfig } from '@src/modules/config/domain/models/config.model';
import type { WhatsAppInteractiveList } from '@src/modules/conversation/whatsapp/domain/models/WhatsappInteractive';

/**
 * WhatsApp Business API Service
 *
 * @description
 * Handles all HTTP requests to Meta's WhatsApp Business API.
 * Includes operations like:
 * - Marking messages as read
 * - Sending messages
 * - Sending media
 * - Sending templates
 *
 * Uses per-client configuration to support multi-tenancy.
 */
@Injectable()
export class WhatsAppApiService {
  private readonly logger = new Logger(WhatsAppApiService.name);

  constructor() {}

  /**
   * Mark a WhatsApp message as read
   *
   * @param messageId The WhatsApp message ID to mark as read
   * @param socialConfig Client's social media and WhatsApp Business API configuration
   * @returns API response from WhatsApp Business API
   * @throws ServiceError if the API request fails
   *
   * @description
   * Sends a POST request to WhatsApp Business API to mark a message as read.
   * This prevents the message from appearing as unread in the business inbox.
   * Uses the client's specific API credentials from the database.
   *
   * @example
   * await whatsappApi.markAsRead('wamid.xxx', clientConfig.socialConfig);
   */
  async markAsRead(
    messageId: string,
    socialConfig: SocialConfig
  ): Promise<Record<string, unknown>> {
    this.logger.log(
      `Marking message ${messageId} as read using client config (Phone: ${socialConfig.whatsappDisplayPhone})`,
      WhatsAppApiService.name
    );

    const apiUrl = `${socialConfig.facebookEndpoint}/${socialConfig.whatsappApiVersion}/${socialConfig.whatsappBusinessPhoneId}/messages`;

    this.logger.debug(`API Request URL: ${apiUrl}`, WhatsAppApiService.name);

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          status: 'read',
          message_id: messageId,
        }),
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${socialConfig.whatsappAccessToken}`,
        },
      });

      const data = await response.text();

      if (!response.ok) {
        this.logger.error(
          `Failed to mark message as read. Status: ${response.status}, Response: ${data}`,
          WhatsAppApiService.name
        );
        throw new ServiceError(
          `Failed to mark message as read: ${response.statusText} (${response.status})`
        );
      }

      this.logger.log(
        `Message ${messageId} marked as read successfully, response: ${data}`,
        WhatsAppApiService.name
      );

      return JSON.parse(data) as Record<string, unknown>;
    } catch (error) {
      if (error instanceof ServiceError) {
        throw error;
      }

      this.logger.error(
        `Error marking message as read: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined
      );

      throw new ServiceError(
        `Failed to mark message as read: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Send a text message to a user
   *
   * @param to User's WhatsApp phone number
   * @param text Message text
   * @param socialConfig Client's social media and WhatsApp Business API configuration
   * @returns WhatsApp message ID (wamid) and full API response
   * @throws ServiceError if the API request fails
   *
   * @description
   * Sends a text message to a WhatsApp user.
   * Can only be sent within the 24-hour messaging window.
   *
   * Returns the WhatsApp Message ID (wamid) which is used to:
   * - Track message delivery status
   * - Correlate status webhooks with sent messages
   * - Monitor message lifecycle
   *
   * @example
   * const { whatsappMessageId } = await whatsappApi.sendTextMessage(
   *   '+15551234567',
   *   'Hello from bot!',
   *   clientConfig.socialConfig
   * );
   * // whatsappMessageId: "wamid.HBgMNTczMTEzMjMwMDMzFQIAERgSRkZCQ0U0ODYzMjBGMjA5QjRFAA=="
   */
  async sendTextMessage(
    to: string,
    text: string,
    socialConfig: SocialConfig
  ): Promise<{ whatsappMessageId: string; response: Record<string, unknown> }> {
    this.logger.log(
      `Sending text message to ${to} using client config (Phone: ${socialConfig.whatsappDisplayPhone})`
    );

    const apiUrl = `${socialConfig.facebookEndpoint}/${socialConfig.whatsappApiVersion}/${socialConfig.whatsappBusinessPhoneId}/messages`;

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to,
          type: 'text',
          text: {
            body: text,
          },
        }),
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${socialConfig.whatsappAccessToken}`,
        },
      });

      const data = await response.text();

      if (!response.ok) {
        this.logger.error(
          `Failed to send text message. Status: ${response.status}, Response: ${data}`
        );
        throw new ServiceError(
          `Failed to send message: ${response.statusText} (${response.status})`
        );
      }

      const parsedResponse = JSON.parse(data) as Record<string, unknown>;

      /* Extract WhatsApp message ID (wamid) from response */
      const whatsappMessageId = this.extractMessageId(parsedResponse);

      this.logger.log(
        `Text message sent successfully to ${to} - wamid: ${whatsappMessageId}`
      );

      return {
        whatsappMessageId,
        response: parsedResponse,
      };
    } catch (error) {
      if (error instanceof ServiceError) {
        throw error;
      }

      this.logger.error(
        `Error sending text message: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined
      );

      throw new ServiceError(
        `Failed to send text message: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Send an image message with optional caption to a user.
   *
   * @param to User's WhatsApp phone number
   * @param imageLink Publicly accessible image URL (presigned or external)
   * @param caption Optional caption text (max 1024 chars)
   * @param socialConfig Client's social media configuration
   * @returns WhatsApp message ID (wamid) and full API response
   * @throws ServiceError if the API request fails
   */
  async sendImageMessage(
    to: string,
    imageLink: string,
    caption: string | undefined,
    socialConfig: SocialConfig
  ): Promise<{ whatsappMessageId: string; response: Record<string, unknown> }> {
    this.logger.log(`Sending image message to ${to}`);

    const apiUrl = `${socialConfig.facebookEndpoint}/${socialConfig.whatsappApiVersion}/${socialConfig.whatsappBusinessPhoneId}/messages`;

    try {
      const payload = {
        messaging_product: 'whatsapp',
        to,
        type: 'image',
        image: {
          link: imageLink,
          ...(caption
            ? {
                caption: caption.substring(0, 1024),
              }
            : {}),
        },
      };

      const response = await fetch(apiUrl, {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${socialConfig.whatsappAccessToken}`,
        },
      });

      const data = await response.text();

      if (!response.ok) {
        this.logger.error(
          `Failed to send image message. Status: ${response.status}, Response: ${data}`
        );
        throw new ServiceError(
          `Failed to send image message: ${response.statusText} (${response.status})`
        );
      }

      const parsedResponse = JSON.parse(data) as Record<string, unknown>;
      const whatsappMessageId = this.extractMessageId(parsedResponse);

      this.logger.log(
        `Image message sent successfully to ${to} - wamid: ${whatsappMessageId}`
      );

      return {
        whatsappMessageId,
        response: parsedResponse,
      };
    } catch (error) {
      if (error instanceof ServiceError) {
        throw error;
      }

      this.logger.error(
        `Error sending image message: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined
      );

      throw new ServiceError(
        `Failed to send image message: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Send a template message (for use outside 24-hour window)
   *
   * @param to User's WhatsApp phone number
   * @param templateName Template name registered in Meta
   * @param templateLanguage Template language code (e.g., 'en', 'es')
   * @param socialConfig Client's social media and WhatsApp Business API configuration
   * @returns API response with message ID
   * @throws ServiceError if the API request fails
   *
   * @description
   * Sends a pre-approved template message.
   * Can be sent at any time, even outside the 24-hour window.
   *
   * @example
   * const response = await whatsappApi.sendTemplateMessage(
   *   '+15551234567',
   *   'hello_world',
   *   'en',
   *   clientConfig.socialConfig
   * );
   */
  async sendTemplateMessage(
    to: string,
    templateName: string,
    templateLanguage: string,
    socialConfig: SocialConfig
  ): Promise<Record<string, unknown>> {
    this.logger.log(
      `Sending template message '${templateName}' to ${to} using client config (Phone: ${socialConfig.whatsappDisplayPhone})`
    );

    const apiUrl = `${socialConfig.facebookEndpoint}/${socialConfig.whatsappApiVersion}/${socialConfig.whatsappBusinessPhoneId}/messages`;

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to,
          type: 'template',
          template: {
            name: templateName,
            language: {
              code: templateLanguage,
            },
          },
        }),
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${socialConfig.whatsappAccessToken}`,
        },
      });

      const data = await response.text();

      if (!response.ok) {
        this.logger.error(
          `Failed to send template message. Status: ${response.status}, Response: ${data}`
        );
        throw new ServiceError(
          `Failed to send template: ${response.statusText} (${response.status})`
        );
      }

      this.logger.log(`Template message sent successfully to ${to}`);

      return JSON.parse(data) as Record<string, unknown>;
    } catch (error) {
      if (error instanceof ServiceError) {
        throw error;
      }

      this.logger.error(
        `Error sending template message: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined
      );

      throw new ServiceError(
        `Failed to send template message: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Send interactive list message via WhatsApp
   *
   * @param to Recipient phone number (E.164 format)
   * @param interactive Interactive list configuration
   * @param socialConfig Client's social media and WhatsApp Business API configuration
   * @returns API response with message ID
   * @throws ServiceError if the API request fails
   *
   * @description
   * Sends an interactive list message to WhatsApp.
   * Used for:
   * - Showing products/services catalog
   * - Presenting menu options
   * - Allowing user to select from predefined choices
   *
   * List limitations:
   * - Max 10 sections
   * - Max 10 rows per section
   * - Button text: max 20 characters
   * - Row title: max 24 characters
   * - Row description: max 72 characters
   *
   * @example
   * await whatsappApi.sendInteractiveList(
   *   '573135137208',
   *   {
   *     type: 'list',
   *     header: { type: 'text', text: 'Ofertas disponibles' },
   *     body: { text: 'Selecciona tu servicio' },
   *     action: {
   *       button: 'Ver ofertas',
   *       sections: [...]
   *     }
   *   },
   *   clientConfig.socialConfig
   * );
   */
  async sendInteractiveList(
    to: string,
    interactive: WhatsAppInteractiveList,
    socialConfig: SocialConfig
  ): Promise<{ whatsappMessageId: string; response: Record<string, unknown> }> {
    this.logger.log(`Sending interactive list message to ${to}`);

    const apiUrl = `${socialConfig.facebookEndpoint}/${socialConfig.whatsappApiVersion}/${socialConfig.whatsappBusinessPhoneId}/messages`;

    try {
      const payload = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to,
        type: 'interactive',
        interactive,
      };

      this.logger.debug(
        `Interactive list payload: ${JSON.stringify(payload, null, 2)}`
      );

      const response = await fetch(apiUrl, {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${socialConfig.whatsappAccessToken}`,
        },
      });

      const data = await response.text();

      if (!response.ok) {
        this.logger.error(
          `Failed to send interactive list. Status: ${response.status}, Response: ${data}`
        );
        throw new ServiceError(
          `Failed to send interactive list: ${response.statusText} (${response.status})`
        );
      }

      const parsedResponse = JSON.parse(data) as Record<string, unknown>;
      const whatsappMessageId = this.extractMessageId(parsedResponse);

      this.logger.log(
        `Interactive list message sent successfully to ${to} - wamid: ${whatsappMessageId}`
      );

      return {
        whatsappMessageId,
        response: parsedResponse,
      };
    } catch (error) {
      if (error instanceof ServiceError) {
        throw error;
      }

      this.logger.error(
        `Error sending interactive list: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined
      );

      throw new ServiceError(
        `Failed to send interactive list: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Extract WhatsApp message ID from API response
   *
   * @param response API response from WhatsApp
   * @returns WhatsApp message ID (wamid)
   * @private
   *
   * @description
   * Extracts the wamid from WhatsApp's response.
   * Response format: { messages: [{ id: "wamid.xxx" }] }
   *
   * The wamid is critical for:
   * - Tracking message delivery status
   * - Correlating status webhooks
   * - Analytics and monitoring
   */
  private extractMessageId(response: Record<string, unknown>): string {
    try {
      const messages = response.messages as Array<{ id: string }>;
      if (messages && messages.length > 0 && messages[0].id) {
        return messages[0].id;
      }

      this.logger.warn('No message ID found in WhatsApp response');
      return '';
    } catch (error) {
      this.logger.error(
        `Error extracting message ID from response: ${error instanceof Error ? error.message : String(error)}`
      );
      return '';
    }
  }
}
