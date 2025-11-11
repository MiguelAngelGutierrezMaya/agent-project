/**
 * WhatsApp Interactive Messages
 *
 * @description
 * Interfaces for WhatsApp interactive message types.
 * These messages allow users to interact with buttons, lists, etc.
 *
 * Documentation: https://developers.facebook.com/docs/whatsapp/cloud-api/guides/send-messages#interactive-messages
 */

/**
 * Section in WhatsApp interactive list
 */
export interface WhatsAppListSection {
  /** Section title (e.g., "Logos", "Paginas Web") */
  title: string;

  /** Rows/items in this section */
  rows: Array<{
    /** Unique row identifier */
    id: string;

    /** Row title (max 24 chars) */
    title: string;

    /** Row description (max 72 chars) */
    description: string;
  }>;
}

/**
 * WhatsApp Interactive List Message
 */
export interface WhatsAppInteractiveList {
  /** Message type */
  type: 'list';

  /** Optional header */
  header?: {
    type: 'text';
    text: string;
  };

  /** Body text (required) */
  body: {
    text: string;
  };

  /** Optional footer */
  footer?: {
    text: string;
  };

  /** Action configuration */
  action: {
    /** Button text to open the list (max 20 chars) */
    button: string;

    /** Sections in the list (max 10 sections) */
    sections: WhatsAppListSection[];
  };
}

/**
 * DTO for sending interactive list message
 */
export interface SendInteractiveListDTO {
  /** Recipient phone number */
  to: string;

  /** Interactive list configuration */
  interactive: WhatsAppInteractiveList;
}
