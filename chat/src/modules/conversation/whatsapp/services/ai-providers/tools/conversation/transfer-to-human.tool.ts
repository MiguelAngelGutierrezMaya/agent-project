import { DynamicStructuredTool } from '@langchain/core/tools';
import {
  TOOL_DESCRIPTIONS,
  TOOL_NAMES,
} from '@src/modules/conversation/whatsapp/services/ai-providers/constants/tools';

/**
 * Transfer To Human Tool Input Schema
 *
 * @description
 * Optional schema that allows the AI to provide a short reason
 * for the human handoff so we can keep track of user intent.
 */
export type TransferToHumanToolInput = {
  /** Optional brief summary describing why the handoff is needed */
  reason?: string;
};

/**
 * Create Transfer To Human Tool
 *
 * @description
 * LangChain tool definition that signals the platform the user
 * should be transferred to a human advisor.
 */
export function createTransferToHumanTool() {
  return new DynamicStructuredTool({
    name: TOOL_NAMES.TRANSFER_TO_HUMAN,
    description: TOOL_DESCRIPTIONS.TRANSFER_TO_HUMAN,
    schema: {
      type: 'object' as const,
      properties: {
        reason: {
          type: 'string' as const,
          description:
            'Optional short summary describing why the handoff to a human advisor is required.',
        },
      },
      additionalProperties: false,
    } as const,
    func: async (): Promise<string> => {
      return new Promise(resolve =>
        resolve('Transfer to human tool execution handled by provider')
      );
    },
  });
}
