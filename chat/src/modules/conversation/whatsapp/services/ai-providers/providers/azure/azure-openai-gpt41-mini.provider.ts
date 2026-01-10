import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChatOpenAI } from '@langchain/openai';
import {
  SystemMessage,
  HumanMessage,
  AIMessage as LangChainAIMessage,
  ToolMessage,
  type BaseMessage,
} from '@langchain/core/messages';
import { ConversationSummaryMemory } from 'langchain/memory';
import { BaseAIModelProvider } from '@src/modules/conversation/whatsapp/services/ai-providers/providers/base-ai-model.provider';
import type {
  AIGenerationRequest,
  AIGenerationResponse,
  AIToolCall,
} from '@src/modules/conversation/whatsapp/domain/models/AiModelProvider';
import { AIMessageRole } from '@src/modules/conversation/whatsapp/domain/models/AiModelProvider';
import { createFeaturedProductsTool } from '@src/modules/conversation/whatsapp/services/ai-providers/tools/products/products-search.tool';
import { createProductDetailsTool } from '@src/modules/conversation/whatsapp/services/ai-providers/tools/products/product-details.tool';
import { createCompanyInfoTool } from '@src/modules/conversation/whatsapp/services/ai-providers/tools/company/company-info.tool';
import { createProductSemanticSearchTool } from '@src/modules/conversation/whatsapp/services/ai-providers/tools/products/product-semantic-search.tool';
import { ProductsSearchService } from '@src/modules/conversation/whatsapp/services/ai-providers/tools/products/products-search.service';
import { ProductEmbeddingsSearchService } from '@src/modules/conversation/whatsapp/services/ai-providers/tools/products/product-embeddings-search.service';
import { CompanyInfoService } from '@src/modules/conversation/whatsapp/services/ai-providers/tools/company/company-info.service';
import { createTransferToHumanTool } from '@src/modules/conversation/whatsapp/services/ai-providers/tools/conversation/transfer-to-human.tool';
import { TOOL_NAMES } from '@src/modules/conversation/whatsapp/services/ai-providers/constants/tools';
import { AIModelType } from '@src/modules/conversation/whatsapp/services/ai-providers/providers/ai-model-provider.factory';

/**
 * Azure OpenAI GPT-4.1 Mini Provider
 *
 * @description
 * AI provider using Azure OpenAI Service (via Foundry) with GPT-4.1 Mini model.
 * Handles chat completions using LangChain with OpenAI client configured for Azure endpoint.
 *
 * This provider uses the standard OpenAI client with a custom baseURL to connect
 * to Azure OpenAI Service through Microsoft's Foundry platform, which supports
 * multiple AI providers beyond just OpenAI.
 *
 * GPT-4.1 Mini is Microsoft's latest cost-effective model that offers:
 * - Enhanced performance over GPT-4o Mini
 * - Fast response times
 * - Lower cost per token
 * - Improved balance between performance and cost
 * - Suitable for customer service and general chat applications
 *
 * Configuration required:
 * - AZURE_OPENAI_API_KEY
 * - AZURE_OPENAI_ENDPOINT (full endpoint URL, e.g., https://instance.openai.azure.com/openai/v1/)
 * - AZURE_OPENAI_GPT41_MINI_DEPLOYMENT_NAME (GPT-4.1 Mini deployment name used as model name)
 *
 * @note
 * This provider uses the same Azure OpenAI configuration keys as GPT-4o Mini.
 * If you need separate configurations for different models, add new configuration keys
 * in the configuration service (e.g., azure.openai.gpt41MiniDeploymentName).
 */
@Injectable()
export class AzureOpenAIGpt41MiniProvider extends BaseAIModelProvider {
  private readonly apiKey: string;
  private readonly endpoint: string;
  private readonly deploymentName: string;

  /** Current request context for tool execution */
  private currentRequest: AIGenerationRequest | null = null;

  constructor(
    private readonly configService: ConfigService,
    private readonly productsSearchService: ProductsSearchService,
    private readonly productEmbeddingsSearchService: ProductEmbeddingsSearchService,
    private readonly companyInfoService: CompanyInfoService
  ) {
    super(AzureOpenAIGpt41MiniProvider.name);

    this.apiKey = this.configService.get<string>('azure.openai.apiKey') ?? '';
    this.endpoint =
      this.configService.get<string>('azure.openai.endpoint') ?? '';
    this.deploymentName = 'gpt-4.1-mini';
  }

  getProviderName(): string {
    return AIModelType.AZURE_OPENAI_GPT_41_MINI;
  }

  async generateResponse(
    request: AIGenerationRequest
  ): Promise<AIGenerationResponse> {
    this.logGenerationStart(request);

    /* Store current request context for tool execution */
    this.currentRequest = request;

    const startTime = Date.now();

    try {
      /* Step 1: Initialize base LLM (without tools) */
      const baseLlm = this.createBaseLLM(request);

      /* Step 2: Initialize memory for summarization (uses base LLM) */
      const memory = new ConversationSummaryMemory({
        llm: baseLlm,
        memoryKey: 'chat_history',
        returnMessages: true,
      });

      /* Step 3: Load existing summary into memory if available */
      if (request.existingSummary) {
        await this.loadExistingSummaryToMemory(memory, request.existingSummary);
      }

      /* Step 4: Build conversation messages */
      const messages = this.buildMessages(request);

      this.logger.debug(
        `Invoking Azure OpenAI GPT-4.1 Mini (via Foundry) with ${messages.length} messages (${request.conversationHistory.length} history + system + user)${request.existingSummary ? ' with existing summary' : ''}`
      );

      /* Step 5: Initialize LLM with tools for response generation */
      const llmWithTools = this.createLLMWithTools(baseLlm);

      /* Step 6: Generate initial response using LangChain with tools */
      let response: LangChainAIMessage = await llmWithTools.invoke(messages);

      /* Step 7: Check if AI wants to use tools (ReAct pattern) */
      const initialToolCalls = this.extractToolCalls(response);
      let toolResults: Record<string, unknown> | undefined;

      if (initialToolCalls.length > 0) {
        this.logger.log(
          `AI requested ${initialToolCalls.length} tool(s) - executing and generating final response`
        );

        /* Execute tool and get results */
        const toolCall = initialToolCalls[0];
        toolResults = await this.executeToolCall(toolCall);

        /* Call AI again with tool results to get final response */
        response = await this.generateResponseWithToolResults(
          llmWithTools,
          messages,
          response,
          toolCall,
          toolResults
        );
      }

      /* Step 8: Save conversation to memory for summary generation */
      await this.saveConversationToMemory(memory, request, response);

      /* Step 9: Get updated summary from memory */
      const summary = await this.getSummaryFromMemory(memory);

      const generationTime = Date.now() - startTime;

      /* Step 10: Extract response text */
      const responseText = this.extractResponseText(response);

      /* Step 12: Extract token usage */
      const tokensUsed = this.extractTokenUsage(response);

      this.logger.debug(
        `Response generated - Tokens: ${tokensUsed.total}, Time: ${generationTime}ms, Summary: "${summary.substring(0, 50)}..."${initialToolCalls.length > 0 ? `, Tool Calls: ${initialToolCalls.length}` : ''}`
      );

      /* Step 13: Return formatted response with summary, tool calls, and tool results */
      return {
        text: responseText,
        model: this.deploymentName,
        summary,
        toolCalls: initialToolCalls.length > 0 ? initialToolCalls : undefined,
        toolResults,
        tokensUsed,
        generationTime,
        success: true,
      };
    } catch (error) {
      const generationTime = Date.now() - startTime;

      this.logger.error(
        `Azure OpenAI GPT-4.1 Mini (via Foundry) error: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined
      );

      this.logGenerationFailure(
        error instanceof Error ? error.message : String(error)
      );

      return {
        text: '',
        model: this.deploymentName,
        summary: '',
        generationTime,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    } finally {
      /* Clear current request context */
      this.currentRequest = null;
    }
  }

  /**
   * Create base OpenAI LLM instance without tools (configured for Azure endpoint)
   *
   * @param request AI generation request
   * @returns Configured ChatOpenAI instance
   * @private
   *
   * @description
   * Creates a clean LangChain ChatOpenAI instance without tools, configured to use
   * Azure OpenAI Service via the Foundry platform by creating a custom OpenAI client
   * with the correct authentication headers.
   * This is used for:
   * - ConversationSummaryMemory (needs clean LLM interface)
   * - Base configuration before binding tools
   *
   * Uses request parameters for temperature and maxTokens, with sensible defaults.
   * The deployment name is used as the model name, and the endpoint is used as baseURL.
   * Azure Foundry requires the api-key header instead of Authorization Bearer, so we
   * create a custom OpenAI client with defaultHeaders configured correctly.
   */
  private createBaseLLM(request: AIGenerationRequest): ChatOpenAI {
    /*
     * Azure Foundry configuration using standard OpenAI client with custom baseURL.
     * The OpenAI SDK automatically handles Azure authentication when baseURL points to Azure endpoint.
     */
    this.logger.debug(
      `Creating ChatOpenAI with endpoint: ${this.endpoint}, model: ${this.deploymentName}`
    );

    return new ChatOpenAI({
      apiKey: this.apiKey,
      model: this.deploymentName,
      temperature: request.temperature,
      maxTokens: request.maxTokens,
      configuration: {
        baseURL: this.endpoint,
      },
    });
  }

  /**
   * Create LLM with tools bound for response generation
   *
   * @param baseLlm Base OpenAI LLM instance (configured for Azure endpoint)
   * @returns Runnable with tools bound
   * @private
   *
   * @description
   * Binds tools to the base LLM for response generation.
   * Returns a Runnable (not ChatOpenAI) which is correct for tool usage.
   *
   * Tools Integration:
   * - Products/Services Search: Allows AI to search company offerings
   * - More tools can be added here in the future
   *
   * The AI will automatically decide when to call tools based on user intent.
   * Uses .bindTools() which is the recommended LangChain v0.2+ approach.
   */
  private createLLMWithTools(baseLlm: ChatOpenAI) {
    /* Initialize tools */
    const featuredProductsTool = createFeaturedProductsTool();
    const productDetailsTool = createProductDetailsTool();
    const companyInfoTool = createCompanyInfoTool();
    const productSemanticSearchTool = createProductSemanticSearchTool();
    const transferToHumanTool = createTransferToHumanTool();

    /* Bind tools to LLM (returns Runnable, NOT AzureChatOpenAI) */
    return baseLlm.bindTools([
      featuredProductsTool,
      productDetailsTool,
      companyInfoTool,
      productSemanticSearchTool,
      transferToHumanTool,
    ]);
  }

  /**
   * Execute tool call based on tool name
   *
   * @param toolCall Tool call from AI
   * @returns Tool execution results
   * @private
   *
   * @description
   * Executes the appropriate tool based on the tool name.
   * Uses a clean mapping approach instead of switch statements.
   */
  private async executeToolCall(
    toolCall: AIToolCall
  ): Promise<Record<string, unknown>> {
    this.logger.log(
      `Executing tool: ${toolCall.toolName} with args: ${JSON.stringify(toolCall.arguments)}`
    );

    /* Tool execution handlers map */
    const toolHandlers: Record<string, () => Promise<Record<string, unknown>>> =
      {
        [TOOL_NAMES.SHOW_FEATURED_PRODUCTS]: () =>
          this.executeFeaturedProductsTool(),
        [TOOL_NAMES.GET_PRODUCT_DETAILS]: () =>
          this.executeProductDetailsTool(
            toolCall.arguments.productId as string
          ),
        [TOOL_NAMES.GET_COMPANY_INFO]: () => this.executeCompanyInfoTool(),
        [TOOL_NAMES.SEARCH_PRODUCTS]: () =>
          this.executeProductSemanticSearchTool(
            toolCall.arguments.query as string
          ),
        [TOOL_NAMES.TRANSFER_TO_HUMAN]: () =>
          this.executeTransferToHumanTool(
            toolCall.arguments.reason as string | undefined
          ),
      };

    /* Get and execute handler */
    const handler = toolHandlers[toolCall.toolName];

    if (!handler) {
      this.logger.warn(`Unknown tool: ${toolCall.toolName}`);
      return { error: `Unknown tool: ${toolCall.toolName}` };
    }

    return handler();
  }

  /**
   * Execute featured products tool
   *
   * @returns Featured products results
   * @private
   *
   * @description
   * Gets featured products using the shared service.
   * Uses the schema from the current request context for multi-tenancy.
   */
  private async executeFeaturedProductsTool(): Promise<
    Record<string, unknown>
  > {
    if (!this.currentRequest) {
      this.logger.error(
        'No current request context available for tool execution'
      );
      return { error: 'No request context available' };
    }

    this.logger.debug(
      `Getting featured products with schema: ${this.currentRequest.schema}`
    );

    const products = await this.productsSearchService.getFeaturedProducts(
      this.currentRequest.schema
    );

    this.logger.debug(
      `Featured products retrieved - Schema: ${this.currentRequest.schema}, Found ${products.length} featured products`
    );

    /* Return only products for JSON serialization */
    return {
      products,
    };
  }

  /**
   * Execute product details tool
   *
   * @param productId Product ID to get details for
   * @returns Product details results
   * @private
   *
   * @description
   * Gets detailed product information using the shared service.
   * Uses the schema from the current request context for multi-tenancy.
   */
  private async executeProductDetailsTool(
    productId: string
  ): Promise<Record<string, unknown>> {
    if (!this.currentRequest) {
      this.logger.error(
        'No current request context available for tool execution'
      );
      return { error: 'No request context available' };
    }

    this.logger.debug(
      `Getting product details with schema: ${this.currentRequest.schema}, productId: ${productId}`
    );

    const product = await this.productsSearchService.getProductDetails(
      this.currentRequest.schema,
      productId
    );

    if (product) {
      this.logger.debug(
        `Product details retrieved - Schema: ${this.currentRequest.schema}, Product ID: ${productId}, Found: ${product.name}`
      );
    } else {
      this.logger.debug(
        `Product not found - Schema: ${this.currentRequest.schema}, Product ID: ${productId}`
      );
    }

    /* Return product details for JSON serialization */
    return {
      detail: product?.details ?? 'No product details found',
      product: {
        ...product,
      },
    };
  }

  /**
   * Execute company info tool
   *
   * @returns Company information results
   * @private
   *
   * @description
   * Gets company information using the shared service.
   * Uses the schema from the current request context for multi-tenancy.
   */
  private async executeCompanyInfoTool(): Promise<Record<string, unknown>> {
    if (!this.currentRequest) {
      this.logger.error(
        'No current request context available for tool execution'
      );
      return { error: 'No request context available' };
    }

    this.logger.debug(
      `Getting company info with schema: ${this.currentRequest.schema}`
    );

    const companyInfo = await this.companyInfoService.getCompanyInfo(
      this.currentRequest.schema
    );

    if (companyInfo) {
      this.logger.debug(
        `Company info retrieved - Schema: ${this.currentRequest.schema}, Name: ${companyInfo.name}`
      );
    } else {
      this.logger.debug(
        `Company info not found - Schema: ${this.currentRequest.schema}`
      );
    }

    /* Return company info for JSON serialization */
    return {
      companyInfo,
    };
  }

  /**
   * Execute product semantic search tool
   *
   * @param query Natural language search query
   * @returns Product search results
   * @private
   *
   * @description
   * Performs semantic search for products using vector embeddings.
   * Uses the schema from the current request context for multi-tenancy.
   */
  private async executeProductSemanticSearchTool(
    query: string
  ): Promise<Record<string, unknown>> {
    if (!this.currentRequest) {
      this.logger.error(
        'No current request context available for tool execution'
      );
      return { error: 'No request context available' };
    }

    this.logger.debug(
      `Searching products by embedding with schema: ${this.currentRequest.schema}, query: "${query}"`
    );

    const products = await this.productEmbeddingsSearchService.searchProducts(
      this.currentRequest.schema,
      query,
      1 // Limit to 1 result for now
    );

    this.logger.debug(
      `Product semantic search completed - Schema: ${this.currentRequest.schema}, Query: "${query}", Found ${products.length} products`
    );

    /* Return products for JSON serialization */
    return {
      products,
    };
  }

  /**
   * Execute transfer to human tool
   *
   * @param reason Optional reason provided by AI for the handoff
   * @returns Acknowledgement payload for the tool
   * @private
   */
  private executeTransferToHumanTool(
    reason?: string
  ): Promise<Record<string, unknown>> {
    this.logger.debug(
      `Transfer to human tool invoked${reason ? ` with reason: ${reason}` : ''}`
    );

    return Promise.resolve({
      action: TOOL_NAMES.TRANSFER_TO_HUMAN,
      reason: reason ?? null,
    });
  }

  /**
   * Generate final response with tool results (ReAct pattern)
   *
   * @param llm LLM with tools
   * @param originalMessages Original conversation messages
   * @param toolCallResponse First AI response (with tool calls)
   * @param toolCall Tool that was called
   * @param toolResults Results from tool execution
   * @returns Final AI response with tool context
   * @private
   *
   * @description
   * Implements the ReAct pattern:
   * 1. AI makes tool call
   * 2. We execute the tool
   * 3. We call AI again with tool results
   * 4. AI generates final response with tool context
   *
   * This allows the AI to:
   * - See the actual products found
   * - Generate contextual response
   * - Reference specific products/prices
   */
  private async generateResponseWithToolResults(
    llm: ReturnType<typeof this.createLLMWithTools>,
    originalMessages: BaseMessage[],
    toolCallResponse: LangChainAIMessage,
    toolCall: AIToolCall,
    toolResults: Record<string, unknown>
  ) {
    this.logger.debug(
      `Generating final response with tool results (ReAct second call) - Tool: ${toolCall.toolName}, ID: ${toolCall.id}`
    );

    /* Build new message chain with tool results */
    const messagesWithToolResults = [
      ...originalMessages,
      toolCallResponse, // AI's request to use tool
      new ToolMessage({
        content: JSON.stringify(toolResults),
        tool_call_id: toolCall.id, // Use actual tool call ID from LangChain
      }),
    ];

    /* Call AI again with tool results */
    const finalResponse = await llm.invoke(messagesWithToolResults);

    this.logger.debug(
      `Final response generated after tool execution: "${this.extractResponseText(finalResponse).substring(0, 100)}..."`
    );

    return finalResponse;
  }

  /**
   * Build conversation messages for LangChain
   *
   * @param request AI generation request
   * @returns Array of LangChain messages
   * @private
   *
   * @description
   * Converts our AIMessage format to LangChain's BaseMessage format.
   * Includes system prompt, conversation history, and current user message.
   *
   * Message types:
   * - SystemMessage: Sets the AI's behavior and context
   * - HumanMessage: User's messages
   * - AIMessage: Assistant's previous responses
   */
  private buildMessages(request: AIGenerationRequest): BaseMessage[] {
    const messages: BaseMessage[] = [];

    /* Add system prompt */
    if (request.systemPrompt) {
      messages.push(new SystemMessage(request.systemPrompt));
    }

    /* Add conversation history */
    for (const msg of request.conversationHistory) {
      if (msg.role === AIMessageRole.USER) {
        messages.push(new HumanMessage(msg.content));
      } else if (msg.role === AIMessageRole.ASSISTANT) {
        messages.push(new LangChainAIMessage(msg.content));
      } else if (msg.role === AIMessageRole.SYSTEM) {
        messages.push(new SystemMessage(msg.content));
      }
    }

    /* Add current user message */
    messages.push(new HumanMessage(request.userMessage));

    return messages;
  }

  /**
   * Extract response text from LangChain response
   *
   * @param response LangChain AI message response
   * @returns Response text content
   * @private
   *
   * @description
   * Extracts the text content from LangChain's response.
   * Handles both string and object content formats.
   */
  private extractResponseText(response: LangChainAIMessage): string {
    if (typeof response.content === 'string') {
      return response.content;
    }

    /* Handle structured content (for future multimodal responses) */
    if (Array.isArray(response.content)) {
      return response.content
        .map(part => {
          if (typeof part === 'string') return part;
          if (typeof part === 'object' && part !== null && 'text' in part) {
            return String(part.text);
          }
          return '';
        })
        .join('');
    }

    this.logger.warn(
      `Unexpected response content format: ${typeof response.content}`
    );
    return String(response.content);
  }

  /**
   * Extract token usage from LangChain response
   *
   * @param response LangChain AI message response
   * @returns Token usage information
   * @private
   *
   * @description
   * Extracts token usage metadata from the response.
   * This is useful for:
   * - Cost tracking
   * - Usage analytics
   * - Rate limiting
   * - Performance monitoring
   */
  private extractTokenUsage(response: LangChainAIMessage): {
    prompt: number;
    completion: number;
    total: number;
  } {
    const usage = response.usage_metadata;

    if (!usage) {
      this.logger.warn('No usage metadata in response');
      return { prompt: 0, completion: 0, total: 0 };
    }

    return {
      prompt: usage.input_tokens ?? 0,
      completion: usage.output_tokens ?? 0,
      total: usage.total_tokens ?? 0,
    };
  }

  /**
   * Extract tool calls from LangChain response
   *
   * @param response LangChain AI message response
   * @returns Array of tool calls
   * @private
   *
   * @description
   * Extracts tool call requests from the AI's response.
   * When the AI determines it needs to use a tool (e.g., search products),
   * it returns tool_calls in the response instead of regular text.
   *
   * Tool call structure from LangChain:
   * ```
   * {
   *   tool_calls: [
   *     {
   *       name: "search_products_services",
   *       args: { query: "logos", limit: 10 }
   *     }
   *   ]
   * }
   * ```
   *
   * This gets transformed to our AIToolCall format for consistent handling.
   */
  private extractToolCalls(response: LangChainAIMessage): AIToolCall[] {
    try {
      /* Check if response has tool_calls */
      if (!response.tool_calls || response.tool_calls.length === 0) {
        return [];
      }

      this.logger.debug(
        `Extracting ${response.tool_calls.length} tool call(s) from response`
      );

      /* Map LangChain tool calls to our format */
      return response.tool_calls
        .filter(toolCall => toolCall.id !== undefined)
        .map(toolCall => ({
          toolName: toolCall.name,
          id: toolCall.id,
          arguments: toolCall.args as Record<string, unknown>,
        })) as AIToolCall[];
    } catch (error) {
      this.logger.error(
        `Error extracting tool calls: ${error instanceof Error ? error.message : String(error)}`
      );
      return [];
    }
  }

  /**
   * Load existing summary into memory
   *
   * @param memory LangChain memory instance
   * @param existingSummary Previous conversation summary
   * @private
   *
   * @description
   * Loads the existing summary into memory so that the new summary
   * builds upon it (progressive summarization).
   */
  private async loadExistingSummaryToMemory(
    memory: ConversationSummaryMemory,
    existingSummary: string
  ): Promise<void> {
    try {
      /* Load existing summary as the initial state */
      await memory.saveContext(
        { input: 'Previous conversation context' },
        { output: existingSummary }
      );
    } catch (error) {
      this.logger.warn(
        `Error loading existing summary to memory: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Save conversation to memory for summary generation
   *
   * @param memory LangChain memory instance
   * @param request Original request
   * @param response AI response
   * @private
   *
   * @description
   * Saves the conversation messages to LangChain memory.
   * This allows the memory to generate a summary of the conversation.
   */
  private async saveConversationToMemory(
    memory: ConversationSummaryMemory,
    request: AIGenerationRequest,
    response: LangChainAIMessage
  ): Promise<void> {
    try {
      /* Save conversation history to memory in pairs (user + assistant) */
      let userMessage = '';

      for (const msg of request.conversationHistory) {
        if (msg.role === AIMessageRole.USER) {
          userMessage = msg.content;
        } else if (msg.role === AIMessageRole.ASSISTANT && userMessage) {
          await memory.saveContext(
            { input: userMessage },
            { output: msg.content }
          );
          userMessage = '';
        }
      }

      /* Save current interaction */
      await memory.saveContext(
        { input: request.userMessage },
        { output: this.extractResponseText(response) }
      );
    } catch (error) {
      this.logger.warn(
        `Error saving to memory: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Get summary from LangChain memory
   *
   * @param memory LangChain memory instance
   * @returns Conversation summary
   * @private
   *
   * @description
   * Extracts the summary generated by LangChain ConversationSummaryMemory.
   * Falls back to empty string if memory doesn't have a summary yet.
   */
  private async getSummaryFromMemory(
    memory: ConversationSummaryMemory
  ): Promise<string> {
    try {
      const memoryVariables = await memory.loadMemoryVariables({});
      const chatHistory: unknown = memoryVariables.chat_history;

      /* Handle different memory format types */
      if (!chatHistory) {
        return '';
      }

      if (typeof chatHistory === 'string') {
        return chatHistory;
      }

      /* If summary is an array of messages, extract text */
      if (Array.isArray(chatHistory)) {
        return chatHistory
          .map((msg: unknown) => {
            if (typeof msg === 'string') return msg;
            if (
              typeof msg === 'object' &&
              msg !== null &&
              'content' in msg &&
              typeof msg.content === 'string'
            ) {
              return msg.content;
            }
            return '';
          })
          .join(' ');
      }

      /* Fallback for unexpected types */
      return JSON.stringify(chatHistory);
    } catch (error) {
      this.logger.warn(
        `Error getting summary from memory: ${error instanceof Error ? error.message : String(error)}`
      );
      return '';
    }
  }
}
