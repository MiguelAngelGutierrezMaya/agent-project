import { DynamicStructuredTool } from '@langchain/core/tools';
import {
  TOOL_NAMES,
  TOOL_DESCRIPTIONS,
} from '@src/modules/conversation/whatsapp/services/ai-providers/constants/tools';

/**
 * Product Details Tool Input Schema
 *
 * @description
 * Schema for the get_product_details tool input parameters.
 * The AI must provide the product ID to get detailed information.
 */
export type ProductDetailsToolInput = {
  /** Product ID to get details for */
  productId: string;
};

/**
 * Get Product Details Tool
 *
 * @description
 * LangChain tool definition that allows the AI to get detailed information
 * about a specific product by its ID.
 *
 * Important: This tool does NOT execute the search itself.
 * It only signals the intent. The actual execution happens in the provider
 * using the ReAct pattern (Reasoning + Acting).
 *
 * Flow:
 * 1. AI detects user selected a product (ID in message) → calls this tool
 * 2. Provider detects tool call → executes getProductDetails()
 * 3. Provider calls AI again with results
 * 4. AI generates final response with product details
 * 5. Bot provides detailed product information to user
 */
export function createProductDetailsTool() {
  return new DynamicStructuredTool({
    name: TOOL_NAMES.GET_PRODUCT_DETAILS,
    description: TOOL_DESCRIPTIONS.GET_PRODUCT_DETAILS,

    /**
     * Schema definition using JSON Schema format
     * Requires productId parameter
     */
    schema: {
      type: 'object' as const,
      properties: {
        productId: {
          type: 'string' as const,
          description: 'The ID of the product to get details for',
        },
      },
      required: ['productId'],
    } as const,

    /**
     * Placeholder function (not executed in ReAct pattern)
     *
     * @description
     * This function is required by DynamicStructuredTool but won't be called.
     * The provider will handle tool execution manually for ReAct pattern.
     */
    func: async (): Promise<string> => {
      return new Promise(resolve =>
        resolve('Product details tool execution handled by provider')
      );
    },
  });
}
