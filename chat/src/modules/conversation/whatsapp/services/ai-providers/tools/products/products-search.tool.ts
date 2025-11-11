import { DynamicStructuredTool } from '@langchain/core/tools';
import {
  TOOL_NAMES,
  TOOL_DESCRIPTIONS,
} from '@src/modules/conversation/whatsapp/services/ai-providers/constants/tools';

/**
 * Featured Products Display Tool
 *
 * @description
 * LangChain tool definition that allows the AI to indicate when it wants
 * to show the company's featured products and services.
 *
 * Important: This tool does NOT execute the search itself.
 * It only signals the intent. The actual execution happens in the provider
 * using the ReAct pattern (Reasoning + Acting).
 *
 * Flow:
 * 1. AI detects user wants to see products → calls this tool
 * 2. Provider detects tool call → executes getFeaturedProducts()
 * 3. Provider calls AI again with results
 * 4. AI generates final response with product context
 * 5. bot-interaction service sends WhatsApp interactive list
 */

/**
 * Tool input schema (parameters the AI can pass)
 * Note: This tool doesn't require any parameters as it always shows featured products
 * Using Record<string, never> to represent an empty object type
 */
export type FeaturedProductsToolInput = Record<string, never>;

/**
 * Get the featured products tool definition
 *
 * @returns LangChain tool instance
 *
 * @description
 * Creates a LangChain DynamicStructuredTool definition.
 * This tool does NOT execute the search - it only signals intent.
 * The actual execution happens in the provider using ReAct pattern.
 */
export function createFeaturedProductsTool() {
  return new DynamicStructuredTool({
    name: TOOL_NAMES.SHOW_FEATURED_PRODUCTS,
    description: TOOL_DESCRIPTIONS.SHOW_FEATURED_PRODUCTS,

    /**
     * Schema definition using JSON Schema format
     * No properties needed since this tool always shows featured products
     */
    schema: {
      type: 'object' as const,
      properties: {},
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
        resolve('Featured products tool execution handled by provider')
      );
    },
  });
}
