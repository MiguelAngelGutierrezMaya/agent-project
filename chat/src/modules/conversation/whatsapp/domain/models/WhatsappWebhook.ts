/**
 * WhatsApp Webhook base interfaces
 *
 * Defines the structure of incoming webhook notifications from WhatsApp Business API
 */

/**
 * Metadata about the WhatsApp Business Phone Number
 */
export interface WhatsappMetadata {
  display_phone_number: string;
  phone_number_id: string;
}

/**
 * Contact profile information
 */
export interface WhatsappProfile {
  name: string;
}

/**
 * Contact information from the sender
 */
export interface WhatsappContact {
  profile: WhatsappProfile;
  wa_id: string;
}

/**
 * All possible message types from WhatsApp
 */
export enum WhatsappMessageType {
  TEXT = 'text',
  IMAGE = 'image',
  VIDEO = 'video',
  AUDIO = 'audio',
  DOCUMENT = 'document',
  STICKER = 'sticker',
  CONTACTS = 'contacts',
  LOCATION = 'location',
  INTERACTIVE = 'interactive',
  UNSUPPORTED = 'unsupported',
}

/**
 * Error information for unsupported message types
 */
export interface WhatsappMessageError {
  code: number;
  title: string;
  message: string;
  error_data: {
    details: string;
  };
}

/**
 * Context information for reply messages
 */
export interface WhatsappMessageContext {
  /** WhatsApp message ID that this message is replying to */
  id: string;

  /** Phone number that sent the original message */
  from: string;
}

/**
 * Base message structure (common fields for all message types)
 */
export interface WhatsappBaseMessage {
  from: string;
  id: string;
  timestamp: string;
  type: WhatsappMessageType;
  errors?: WhatsappMessageError[];
  context?: WhatsappMessageContext;
}

/**
 * Message status update from WhatsApp
 *
 * @description
 * Sent when a message we sent changes status (sent → delivered → read)
 */
export interface WhatsappMessageStatus {
  /** WhatsApp message ID (wamid) of the message */
  id: string;

  /** Current status of the message */
  status: 'sent' | 'delivered' | 'read' | 'failed';

  /** Unix timestamp when status changed */
  timestamp: string;

  /** Recipient's phone number */
  recipient_id: string;

  /** Pricing information for this message */
  pricing?: {
    billable: boolean;
    pricing_model: string;
    category: string;
    type: string;
  };

  /** Conversation info */
  conversation?: {
    id: string;
    origin: {
      type: string;
    };
  };

  /** Error information if status is 'failed' */
  errors?: WhatsappMessageError[];
}

/**
 * Value object containing the actual webhook data
 */
export interface WhatsappWebhookValue {
  messaging_product: 'whatsapp';
  metadata: WhatsappMetadata;
  contacts?: WhatsappContact[];
  messages?: WhatsappMessage[];
  statuses?: WhatsappMessageStatus[];
}

/**
 * Change object in the webhook payload
 */
export interface WhatsappWebhookChange {
  value: WhatsappWebhookValue;
  field: 'messages';
}

/**
 * Entry object containing changes for a specific business account
 */
export interface WhatsappWebhookEntry {
  id: string;
  changes: WhatsappWebhookChange[];
}

/**
 * Root webhook payload structure
 */
export interface WhatsappWebhookPayload {
  object: 'whatsapp_business_account';
  entry: WhatsappWebhookEntry[];
}

/**
 * Union type for all possible message types
 */
export type WhatsappMessage =
  | WhatsappTextMessage
  | WhatsappImageMessage
  | WhatsappVideoMessage
  | WhatsappAudioMessage
  | WhatsappDocumentMessage
  | WhatsappStickerMessage
  | WhatsappContactsMessage
  | WhatsappInteractiveMessage
  | WhatsappUnsupportedMessage;

/* ==================== Specific Message Types ==================== */

/**
 * Text message
 */
export interface WhatsappTextMessage extends WhatsappBaseMessage {
  type: WhatsappMessageType.TEXT;
  text: {
    body: string;
  };
}

/**
 * Image message
 */
export interface WhatsappImageMessage extends WhatsappBaseMessage {
  type: WhatsappMessageType.IMAGE;
  image: {
    mime_type: string;
    sha256: string;
    id: string;
    caption?: string;
  };
}

/**
 * Video message (includes GIFs)
 */
export interface WhatsappVideoMessage extends WhatsappBaseMessage {
  type: WhatsappMessageType.VIDEO;
  video: {
    mime_type: string;
    sha256: string;
    id: string;
    caption?: string;
  };
}

/**
 * Audio message (includes voice notes)
 */
export interface WhatsappAudioMessage extends WhatsappBaseMessage {
  type: WhatsappMessageType.AUDIO;
  audio: {
    mime_type: string;
    sha256: string;
    id: string;
    voice?: boolean;
  };
}

/**
 * Document message (PDF, Excel, Word, etc.)
 */
export interface WhatsappDocumentMessage extends WhatsappBaseMessage {
  type: WhatsappMessageType.DOCUMENT;
  document: {
    filename: string;
    mime_type: string;
    sha256: string;
    id: string;
    caption?: string;
  };
}

/**
 * Sticker message
 */
export interface WhatsappStickerMessage extends WhatsappBaseMessage {
  type: WhatsappMessageType.STICKER;
  sticker: {
    mime_type: string;
    sha256: string;
    id: string;
    animated: boolean;
  };
}

/**
 * Contacts message
 */
export interface WhatsappContactsMessage extends WhatsappBaseMessage {
  type: WhatsappMessageType.CONTACTS;
  contacts: WhatsappSharedContact[];
}

/**
 * Shared contact information
 */
export interface WhatsappSharedContact {
  name: {
    first_name?: string;
    last_name?: string;
    formatted_name: string;
  };
  phones?: Array<{
    phone: string;
    wa_id?: string;
    type?: string;
  }>;
  emails?: Array<{
    email: string;
    type?: string;
  }>;
}

/**
 * Interactive message types
 */
export enum WhatsappInteractiveType {
  LIST_REPLY = 'list_reply',
  BUTTON_REPLY = 'button_reply',
}

/**
 * Interactive message (list replies, button replies, etc.)
 */
export interface WhatsappInteractiveMessage extends WhatsappBaseMessage {
  type: WhatsappMessageType.INTERACTIVE;
  interactive: {
    type: WhatsappInteractiveType;
    list_reply?: {
      id: string;
      title: string;
      description?: string;
    };
    button_reply?: {
      id: string;
      title: string;
    };
  };
}

/**
 * Unsupported message type (polls, events, etc.)
 */
export interface WhatsappUnsupportedMessage extends WhatsappBaseMessage {
  type: WhatsappMessageType.UNSUPPORTED;
  errors: WhatsappMessageError[];
}
