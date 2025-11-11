import { Injectable, Logger } from '@nestjs/common';
import type { WhatsappMessage } from '@src/modules/conversation/whatsapp/domain/models/WhatsappWebhook';
import type { ConfigWithSchema } from '@src/modules/config/domain/models/config.model';
import type { Conversation } from '@src/modules/conversation/whatsapp/domain/models/Conversation';
import { MessageSender } from '@src/modules/conversation/whatsapp/domain/models/Message';
import {
  MessageStorageService,
  type CreateOutboundMessageDTO,
} from './message-storage.service';
import { WhatsAppApiService } from './whatsapp-api.service';
import { ConversationStorageService } from './conversation-storage.service';
import { AIModelProviderFactory } from './ai-providers/providers/ai-model-provider.factory';
import type {
  AIMessage,
  AIModelProvider,
  AIGenerationResponse,
} from '@src/modules/conversation/whatsapp/domain/models/AiModelProvider';
import { WhatsappMessageType } from '@src/modules/conversation/whatsapp/domain/models/WhatsappWebhook';
import {
  buildSystemPromptWithSummary,
  getMessageTypePlaceholder,
} from './ai-providers/utils/prompt-builder';
import type { Product } from '@src/modules/conversation/whatsapp/domain/models/Product';
import type { WhatsAppListSection } from '@src/modules/conversation/whatsapp/domain/models/WhatsappInteractive';
import { TOOL_NAMES } from './ai-providers/constants/tools';
import { MessageExtractorFactory } from './message-extractors/message-extractor.factory';
import { ProductMediaService } from './product-media.service';

type MessageDispatchResult = {
  whatsappMessageId: string;
  messageType: WhatsappMessageType;
  messageContent: CreateOutboundMessageDTO['content'];
};

/**
 * Bot Interaction Service
 *
 * @description
 * Orchestrates the interaction between user messages and AI responses.
 *
 * Responsibilities:
 * - Extract text from messages (body or caption)
 * - Get conversation history for AI context
 * - Select appropriate AI model based on client config
 * - Generate AI response
 * - Store bot response in database
 * - Send response via WhatsApp API
 */
@Injectable()
export class BotInteractionService {
  private readonly logger = new Logger(BotInteractionService.name);

  private readonly MAX_CONVERSATION_HISTORY_MESSAGES = 8;

  constructor(
    private readonly aiProviderFactory: AIModelProviderFactory,
    private readonly messageStorage: MessageStorageService,
    private readonly whatsappApi: WhatsAppApiService,
    private readonly conversationStorage: ConversationStorageService,
    private readonly messageExtractorFactory: MessageExtractorFactory,
    private readonly productMediaService: ProductMediaService
  ) {}

  /**
   * Process user message and generate bot response
   *
   * @param message WhatsApp message from user
   * @param clientConfig Complete client configuration
   * @param conversation Conversation context
   *
   * @description
   * Main orchestrator for bot interaction.
   * Delegates to specialized methods for clean separation of concerns.
   */
  async processUserMessage(
    message: WhatsappMessage,
    clientConfig: ConfigWithSchema,
    conversation: Conversation
  ): Promise<void> {
    this.logger.log(
      `Processing user message for bot interaction - Conversation: ${conversation.conversationId}`
    );

    try {
      /* Step 1: Prepare user message for AI */
      const userText = this.prepareUserMessage(message);

      /* Step 2: Generate AI response with full context */
      const aiResponse = await this.generateAIResponse(
        userText,
        conversation,
        clientConfig
      );

      if (!aiResponse.success) {
        this.logger.error(
          `Failed to generate AI response: ${aiResponse.error ?? 'Unknown error'}`
        );
        return;
      }

      /* Step 3: Send appropriate WhatsApp message */
      const { whatsappMessageId, messageType, messageContent } =
        await this.sendWhatsAppMessage(
          message.from,
          aiResponse,
          clientConfig,
          conversation
        );

      /* Step 4: Store message and update conversation */
      await this.saveMessageAndUpdateConversation(
        conversation,
        clientConfig.schema,
        whatsappMessageId,
        messageType,
        messageContent,
        aiResponse
      );

      this.logger.log(
        `Bot interaction completed successfully for conversation ${conversation.conversationId}`
      );
    } catch (error) {
      this.logger.error(
        `Error processing bot interaction for message ${message.id}`,
        error instanceof Error ? error.stack : String(error)
      );
      /* Don't throw - we don't want to fail the webhook if bot response fails */
    }
  }

  /**
   * Prepare user message for AI processing
   *
   * @param message WhatsApp message from user
   * @returns Text to send to AI
   * @private
   */
  private prepareUserMessage(message: WhatsappMessage): string {
    const extractedText = this.extractTextFromMessage(message);
    const userText = extractedText ?? getMessageTypePlaceholder(message.type);

    this.logger.log(
      extractedText
        ? `User text extracted: "${userText.substring(0, 100)}..."`
        : `No text in message, using placeholder: "${userText}"`
    );

    return userText;
  }

  /**
   * Generate AI response with full context
   *
   * @param userText User message text
   * @param conversation Conversation context
   * @param clientConfig Client configuration
   * @returns AI generation response
   * @private
   */
  private async generateAIResponse(
    userText: string,
    conversation: Conversation,
    clientConfig: ConfigWithSchema
  ) {
    /* Get conversation history */
    const conversationHistory = await this.getConversationHistory(
      clientConfig.schema,
      conversation.conversationId
    );

    this.logger.debug(
      `Retrieved ${conversationHistory.length} messages for context: ${conversationHistory.map(msg => msg.content).join(', ')}`
    );

    /* Get AI provider */
    const aiProvider = this.getAIProviderForClient(clientConfig);

    /* Build system prompt with summary */
    const systemPrompt = buildSystemPromptWithSummary(
      conversation.aiContext.summary
    );

    this.logger.debug(
      `System prompt built with summary: ${conversation.aiContext.summary ? 'Yes' : 'No (new conversation)'}`
    );

    /* Generate response */
    const aiResponse = await aiProvider.generateResponse({
      userMessage: userText,
      conversationHistory,
      systemPrompt,
      existingSummary: conversation.aiContext.summary,
      schema: clientConfig.schema,
      maxTokens: clientConfig.aiConfig.maxTokens,
      temperature: clientConfig.aiConfig.temperature,
    });

    this.logger.log(
      `AI response generated: "${aiResponse.text.substring(0, 100)}..." | Summary: "${aiResponse.summary.substring(0, 50)}..."${aiResponse.toolCalls ? ` | Tool Calls: ${aiResponse.toolCalls.length}` : ''}`
    );

    return aiResponse;
  }

  /**
   * Send appropriate WhatsApp message based on AI response
   *
   * @param to Recipient phone number
   * @param aiResponse AI generation response
   * @param clientConfig Client configuration
   * @returns Message details for DB storage
   * @private
   */
  private async sendWhatsAppMessage(
    to: string,
    aiResponse: AIGenerationResponse,
    clientConfig: ConfigWithSchema,
    conversation: Conversation
  ): Promise<MessageDispatchResult> {
    this.logger.debug(
      `Validating message - AI response: ${JSON.stringify(aiResponse)}`
    );
    const toolHandledMessage = await this.handleToolResponse(
      to,
      aiResponse,
      clientConfig,
      conversation
    );

    if (toolHandledMessage) {
      return toolHandledMessage;
    }

    /* No tools or unsupported tool - send regular text message */
    return this.sendTextMessage(to, aiResponse.text, clientConfig);
  }

  /**
   * Send regular text message
   *
   * @param to Recipient phone number
   * @param text Message text
   * @param clientConfig Client configuration
   * @returns Message details for DB storage
   * @private
   */
  private async sendTextMessage(
    to: string,
    text: string,
    clientConfig: ConfigWithSchema
  ): Promise<MessageDispatchResult> {
    this.logger.debug('Sending text message');

    const { whatsappMessageId } = await this.whatsappApi.sendTextMessage(
      to,
      text,
      clientConfig.socialConfig
    );

    return {
      whatsappMessageId,
      messageType: WhatsappMessageType.TEXT,
      messageContent: {
        text: {
          body: text,
        },
      },
    };
  }

  private async handleToolResponse(
    to: string,
    aiResponse: AIGenerationResponse,
    clientConfig: ConfigWithSchema,
    conversation: Conversation
  ): Promise<MessageDispatchResult | null> {
    if (!aiResponse.toolCalls?.length || !aiResponse.toolResults) {
      return null;
    }

    const [toolCall] = aiResponse.toolCalls;
    const toolResults = aiResponse.toolResults;

    const handlers: Record<
      string,
      () => Promise<MessageDispatchResult | null>
    > = {
      [TOOL_NAMES.SHOW_FEATURED_PRODUCTS]: async () =>
        this.sendProductFeaturedMessage({
          to,
          toolResults,
          clientConfig,
        }),
      [TOOL_NAMES.GET_PRODUCT_DETAILS]: async () =>
        this.sendProductPreviewMessage({
          to,
          product: this.extractProductFromDetailsResult(toolResults),
          aiMessage: aiResponse.text,
          clientConfig,
        }),
      [TOOL_NAMES.SEARCH_PRODUCTS]: async () =>
        this.sendProductPreviewMessage({
          to,
          product: this.extractFirstProduct(toolResults),
          aiMessage: aiResponse.text,
          clientConfig,
        }),
      [TOOL_NAMES.TRANSFER_TO_HUMAN]: async () =>
        this.handleTransferToHuman({
          to,
          clientConfig,
          aiMessage: aiResponse.text,
          conversation,
        }),
    };

    const handler = handlers[toolCall.toolName];

    if (!handler) {
      this.logger.warn(
        `Unsupported tool "${toolCall.toolName}" - sending text message instead.`
      );
      return null;
    }

    return handler();
  }

  private async handleTransferToHuman(params: {
    to: string;
    clientConfig: ConfigWithSchema;
    aiMessage: string;
    conversation: Conversation;
  }): Promise<MessageDispatchResult | null> {
    const { to, clientConfig, aiMessage, conversation } = params;

    this.logger.log(
      `Transfer to human requested for conversation ${conversation.conversationId}`
    );

    await this.conversationStorage.transferConversationToHuman(
      conversation.schema,
      conversation.conversationId
    );

    return this.sendTextMessage(to, aiMessage, clientConfig);
  }

  private async sendProductFeaturedMessage(params: {
    to: string;
    toolResults: Record<string, unknown>;
    clientConfig: ConfigWithSchema;
  }): Promise<MessageDispatchResult | null> {
    const { to, toolResults, clientConfig } = params;

    const products = this.validateProductsSearchResult(toolResults);

    if (!products.length) {
      this.logger.warn(
        'Featured products tool returned an empty list. Falling back to text message.'
      );
      return null;
    }

    return this.sendProductsInteractiveList(to, products, clientConfig);
  }

  private async sendProductPreviewMessage(params: {
    to: string;
    product: Product | null;
    aiMessage: string;
    clientConfig: ConfigWithSchema;
  }): Promise<MessageDispatchResult | null> {
    const { to, product, aiMessage, clientConfig } = params;

    if (!product) {
      this.logger.warn(
        'Product tool returned no product data. Falling back to text message.'
      );
      return null;
    }

    const messageText = this.buildProductMessage(aiMessage, product);
    const imageUrl = await this.resolveProductImageUrl(product.imageUrl);

    if (!imageUrl) {
      this.logger.debug(
        `Product "${product.id}" has no accessible image. Sending text message instead.`
      );
      return this.sendTextMessage(to, messageText, clientConfig);
    }

    const caption = this.buildProductCaption(messageText, product);

    return this.sendImageMessage(
      to,
      imageUrl,
      caption,
      clientConfig,
      product.imageUrl
    );
  }

  private buildProductMessage(aiMessage: string, product: Product): string {
    const segments: string[] = [];
    const trimmedMessage = aiMessage?.trim();

    if (trimmedMessage) {
      segments.push(trimmedMessage);
    } else {
      segments.push(product.name);
    }

    const priceText = this.formatProductPrice(product);
    if (priceText) {
      segments.push(priceText);
    }

    if (product.description) {
      segments.push(product.description);
    }

    if (!trimmedMessage && product.category?.name) {
      segments.push(`Categoría: ${product.category.name}`);
    }

    const message = segments
      .filter(segment => segment && segment.trim().length > 0)
      .join('\n\n')
      .trim();

    return message.length > 0 ? message : product.name;
  }

  private buildProductCaption(message: string, product: Product): string {
    const baseText = message?.trim() || product.name;
    return this.truncateCaption(baseText);
  }

  private truncateCaption(value: string, limit = 1024): string {
    if (!value) {
      return '';
    }
    return value.length <= limit ? value : `${value.substring(0, limit - 1)}…`;
  }

  private formatProductPrice(product: Product): string | null {
    const price = product.details?.price;
    const currency = product.details?.currency;

    if (price === undefined || price === null || !currency) {
      return null;
    }

    const formatted =
      Number.isFinite(price) && typeof price === 'number'
        ? price.toFixed(2)
        : String(price);

    return `Precio: ${formatted} ${currency}`;
  }

  private extractProductFromDetailsResult(
    toolResults: Record<string, unknown>
  ): Product | null {
    const candidate = toolResults.product;
    if (
      candidate &&
      typeof candidate === 'object' &&
      !Array.isArray(candidate)
    ) {
      return candidate as Product;
    }

    return this.extractFirstProduct(toolResults);
  }

  private extractFirstProduct(
    toolResults: Record<string, unknown>
  ): Product | null {
    const products = this.validateProductsSearchResult(toolResults);
    return products[0] ?? null;
  }

  private async resolveProductImageUrl(
    imagePath?: string | null
  ): Promise<string | null> {
    return this.productMediaService.resolveImageUrl(imagePath);
  }

  private async sendImageMessage(
    to: string,
    imageUrl: string,
    caption: string,
    clientConfig: ConfigWithSchema,
    originalKey?: string
  ): Promise<MessageDispatchResult> {
    const captionText = caption.trim();
    const normalizedCaption =
      captionText.length > 0 ? this.truncateCaption(captionText) : undefined;

    const { whatsappMessageId } = await this.whatsappApi.sendImageMessage(
      to,
      imageUrl,
      normalizedCaption,
      clientConfig.socialConfig
    );

    return {
      whatsappMessageId,
      messageType: WhatsappMessageType.IMAGE,
      messageContent: {
        image: {
          link: imageUrl,
          caption: normalizedCaption,
          key: originalKey,
        },
      },
    };
  }

  /**
   * Save message to database and update conversation
   *
   * @param conversation Conversation context
   * @param schema Tenant schema
   * @param whatsappMessageId WhatsApp message ID
   * @param messageType Message type
   * @param messageContent Message content
   * @param aiResponse AI generation response
   * @private
   */
  private async saveMessageAndUpdateConversation(
    conversation: Conversation,
    schema: string,
    whatsappMessageId: string,
    messageType: WhatsappMessageType,
    messageContent: CreateOutboundMessageDTO['content'],
    aiResponse: AIGenerationResponse
  ): Promise<void> {
    /* Store bot response in database */
    const botResponseDto: CreateOutboundMessageDTO = {
      conversationId: conversation.conversationId,
      type: messageType,
      content: messageContent,
      timestamp: new Date(),
      sender: MessageSender.BOT,
      whatsappMessageId,
      aiMetadata: {
        isAiGenerated: true,
        model: aiResponse.model,
        tokensUsed: aiResponse.tokensUsed,
        responseTime: aiResponse.generationTime,
      },
    };

    await this.messageStorage.saveOutboundMessage(schema, botResponseDto);

    /* Update conversation with summary and AI turns */
    await this.conversationStorage.updateConversationAfterBotResponse(
      schema,
      conversation.conversationId,
      aiResponse.summary
    );

    this.logger.debug('Message saved and conversation updated');
  }

  /**
   * Extract text from message using Strategy pattern
   *
   * @param message WhatsApp message
   * @returns Extracted text or null
   * @private
   *
   * @description
   * Uses the MessageExtractorFactory to get the appropriate extractor
   * for the message type and delegates text extraction to it.
   */
  private extractTextFromMessage(message: WhatsappMessage): string | null {
    const extractor = this.messageExtractorFactory.getExtractor(message.type);
    return extractor.extractFromWhatsappMessage(message);
  }

  /**
   * Get conversation history for AI context
   *
   * @param schema Tenant schema
   * @param conversationId Conversation ID
   * @returns Array of AI messages for context
   * @private
   *
   * @description
   * Retrieves recent messages and formats them for AI consumption.
   * Extracts meaningful text from all message types for better context.
   * Limits to last 20 messages to avoid token limits.
   */
  private async getConversationHistory(
    schema: string,
    conversationId: string
  ): Promise<AIMessage[]> {
    try {
      const recentMessages = await this.messageStorage.getRecentMessages(
        schema,
        conversationId,
        this.MAX_CONVERSATION_HISTORY_MESSAGES // Limit to avoid token overflow
      );

      /* Map to AI message format using extractors (reverse to chronological order) */
      const aiMessages = await Promise.all(
        recentMessages.reverse().map(async msg => {
          const extractor = this.messageExtractorFactory.getExtractor(msg.type);
          return extractor.createAIMessage(msg, schema);
        })
      );

      return aiMessages;
    } catch (error) {
      this.logger.error(
        `Error getting conversation history: ${error instanceof Error ? error.message : String(error)}`
      );
      return [];
    }
  }

  /**
   * Get AI provider for client
   *
   * @param clientConfig Complete client configuration
   * @returns AI model provider
   * @private
   *
   * @description
   * Retrieves the AI model provider based on the client's AI configuration.
   * The chatModel from client config determines which provider to use.
   * Falls back to Azure OpenAI if model type cannot be determined.
   *
   * @example
   * // Client config has aiConfig.chatModel = 'gpt-4'
   * const provider = this.getAIProviderForClient(clientConfig);
   */
  private getAIProviderForClient(
    clientConfig: ConfigWithSchema
  ): AIModelProvider {
    this.logger.debug(
      `Getting AI provider for client ${clientConfig.id} - Model: ${clientConfig.aiConfig.chatModel}`
    );

    /* Get model type from client config */
    return this.aiProviderFactory.getProvider(clientConfig.aiConfig.chatModel);
  }

  /**
   * Send products interactive list to WhatsApp
   *
   * @param to Recipient phone number
   * @param description Configurable description text from client config
   * @param products Products array from AI provider
   * @param clientConfig Client configuration
   * @returns Message details for DB storage
   * @private
   *
   * @description
   * Sends an interactive list to WhatsApp based on products search results.
   * Uses configurable texts from client's social configuration:
   * - whatsappListDescription for the body message
   * - whatsappButtonOptionsTitle for the button text
   */
  private async sendProductsInteractiveList(
    to: string,
    products: Product[],
    clientConfig: ConfigWithSchema
  ): Promise<MessageDispatchResult> {
    this.logger.log(
      `Sending products interactive list - ${products.length} products`
    );

    /* Build WhatsApp interactive list sections from products */
    const sections: WhatsAppListSection[] = this.buildListSections(products);

    /* Build interactive list configuration */
    const interactiveList = {
      type: 'list' as const,
      body: {
        text: clientConfig.socialConfig.whatsappListDescription,
      },
      action: {
        button: clientConfig.socialConfig.whatsappButtonOptionsTitle,
        sections,
      },
    };

    /* Send interactive list to WhatsApp */
    const { whatsappMessageId } = await this.whatsappApi.sendInteractiveList(
      to,
      interactiveList,
      clientConfig.socialConfig
    );

    this.logger.log(
      `Interactive list sent - ${products.length} featured products`
    );

    /* Return message details with FULL interactive content for DB storage */
    const messageContent: CreateOutboundMessageDTO['content'] = {
      interactive: interactiveList as {
        type: 'list';
        body: { text: string };
        action: { button: string; sections: WhatsAppListSection[] };
      },
    };

    return {
      whatsappMessageId,
      messageType: WhatsappMessageType.INTERACTIVE as WhatsappMessageType,
      messageContent,
    };
  }

  /**
   * Validate and convert tool results to Product array
   *
   * @param toolResults Raw tool results from AI
   * @returns Validated Product array
   * @private
   *
   * @description
   * Validates that toolResults has the expected structure for products array.
   * Provides type safety when converting from Record<string, unknown>.
   */
  private validateProductsSearchResult(
    toolResults: Record<string, unknown>
  ): Product[] {
    /* Validate required fields */
    if (!Array.isArray(toolResults.products)) {
      this.logger.error(
        'Invalid tool results structure - products array missing',
        JSON.stringify(toolResults)
      );
      /* Return empty array as fallback */
      return [];
    }

    return toolResults.products as Product[];
  }

  /**
   * Build WhatsApp list sections from products
   *
   * @param result Products search result
   * @returns WhatsApp list sections
   * @private
   *
   * @description
   * Groups products by category and builds WhatsApp list sections.
   * Each section has a title (category name) and rows (products).
   *
   * Uses synchronized models from configuration service:
   * - Product.name → WhatsApp row title
   * - Product.description → WhatsApp row description
   * - Product.category.name → WhatsApp section title
   *
   * WhatsApp limitations:
   * - Max 10 sections
   * - Max 10 rows per section
   * - Row title: max 24 chars
   * - Row description: max 72 chars
   */
  private buildListSections(products: Product[]): WhatsAppListSection[] {
    const sections: WhatsAppListSection[] = [];

    /* Group products by category ID */
    const productsByCategory = new Map<string, Product[]>();

    for (const product of products) {
      if (!productsByCategory.has(product.categoryId)) {
        productsByCategory.set(product.categoryId, []);
      }
      productsByCategory.get(product.categoryId)!.push(product);
    }

    /* Build sections using category names from products */
    for (const [, products] of productsByCategory) {
      if (products.length > 0) {
        const firstProduct = products[0];
        sections.push({
          title: firstProduct.category.name.substring(0, 24), // Max 24 chars
          rows: products.slice(0, 10).map((product: Product) => {
            const productName = product.name || '';
            const productDescription = product.description || '';
            return {
              id: product.id,
              title: productName.substring(0, 24), // Max 24 chars - use 'name' not 'title'
              description: productDescription.substring(0, 72), // Max 72 chars
            };
          }),
        });
      }
    }

    return sections.slice(0, 10); // Max 10 sections
  }
}
