import { DynamicStructuredTool } from '@langchain/core/tools';
import {
  TOOL_NAMES,
  TOOL_DESCRIPTIONS,
} from '@src/modules/conversation/whatsapp/services/ai-providers/constants/tools';

/**
 * Product Semantic Search Tool Input Schema
 *
 * @description
 * Schema for the search_products tool input parameters.
 * The AI must provide the search query to perform semantic search.
 */
export type ProductSemanticSearchToolInput = {
  /** Natural language query to search for products */
  query: string;
};

/**
 * Product Semantic Search Tool
 *
 * @description
 * LangChain tool definition that allows the AI to search for products
 * using semantic similarity (vector search) based on natural language queries.
 *
 * Important: This tool does NOT execute the search itself.
 * It only signals the intent. The actual execution happens in the provider
 * using the ReAct pattern (Reasoning + Acting).
 *
 * Flow:
 * 1. AI detects user wants to search for specific products → calls this tool
 * 2. Provider detects tool call → executes searchProducts()
 * 3. Provider calls AI again with results
 * 4. AI generates final response with matching products
 * 5. Bot provides product search results to user
 */
export function createProductSemanticSearchTool() {
  return new DynamicStructuredTool({
    name: TOOL_NAMES.SEARCH_PRODUCTS,
    description: TOOL_DESCRIPTIONS.SEARCH_PRODUCTS,

    /**
     * Schema definition using JSON Schema format
     * Requires query parameter (natural language search query)
     */
    schema: {
      type: 'object' as const,
      properties: {
        query: {
          type: 'string' as const,
          description:
            'Natural language query describing the products or services to search for. Example: "diseño de logo", "página web", "servicios de branding"',
        },
      },
      required: ['query'],
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
        resolve('Product semantic search tool execution handled by provider')
      );
    },
  });
}
