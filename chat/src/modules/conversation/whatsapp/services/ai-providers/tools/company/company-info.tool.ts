import { DynamicStructuredTool } from '@langchain/core/tools';
import {
  TOOL_NAMES,
  TOOL_DESCRIPTIONS,
} from '@src/modules/conversation/whatsapp/services/ai-providers/constants/tools';

/**
 * Company Info Tool Input Schema
 *
 * @description
 * Schema for the get_company_info tool input parameters.
 * This tool doesn't require any parameters as it always gets
 * the company information from the current tenant's configuration.
 */
export type CompanyInfoToolInput = Record<string, never>;

/**
 * Get Company Info Tool
 *
 * @description
 * LangChain tool definition that allows the AI to get company information
 * including website, social media, and contact details.
 *
 * Important: This tool does NOT execute the search itself.
 * It only signals the intent. The actual execution happens in the provider
 * using the ReAct pattern (Reasoning + Acting).
 *
 * Flow:
 * 1. AI detects user asks about company info → calls this tool
 * 2. Provider detects tool call → executes getCompanyInfo()
 * 3. Provider calls AI again with results
 * 4. AI generates final response with company information
 * 5. Bot provides company contact details to user
 */
export function createCompanyInfoTool() {
  return new DynamicStructuredTool({
    name: TOOL_NAMES.GET_COMPANY_INFO,
    description: TOOL_DESCRIPTIONS.GET_COMPANY_INFO,

    /**
     * Schema definition using JSON Schema format
     * No properties needed since this tool always gets company info
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
        resolve('Company info tool execution handled by provider')
      );
    },
  });
}
