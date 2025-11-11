/**
 * AI Tools Constants
 *
 * @description
 * Centralized constants for AI tools definitions.
 * Includes tool names and descriptions used by LangChain.
 */

/**
 * Tool Names
 *
 * @description
 * Unique identifiers for each tool available to the AI.
 * These are used to:
 * - Register tools with LangChain
 * - Detect which tool was called in responses
 * - Route tool execution to appropriate handlers
 */
export const TOOL_NAMES = {
  SHOW_FEATURED_PRODUCTS: 'show_featured_products',
  GET_PRODUCT_DETAILS: 'get_product_details',
  GET_COMPANY_INFO: 'get_company_info',
  SEARCH_PRODUCTS: 'search_products',
  TRANSFER_TO_HUMAN: 'transfer_to_human',
} as const;

/**
 * Tool Descriptions
 *
 * @description
 * Descriptions that the AI uses to decide when to call each tool.
 * These should be:
 * - Clear and specific about when to use the tool
 * - Include examples of user queries
 * - List what NOT to use the tool for
 */
export const TOOL_DESCRIPTIONS = {
  SHOW_FEATURED_PRODUCTS: `Show the company's featured products and services.

Use this tool when the user asks about:
- What products or services are available
- What the company offers or sells
- General inquiries about offerings
- Greetings followed by product/service questions
- Requests to see products, services, or catalog

Examples of when to use:
- "¿Qué servicios ofrecen?"
- "Hola, ¿qué productos tienen?"
- "Muestrame sus productos"
- "Necesito un diseño"
- "What do you offer?"
- "Show me your services"
- "¿Qué hacen ustedes?"
- "Cuéntame sobre sus servicios"
- "Hola, me interesa saber qué ofrecen"

DO NOT use this tool for:
- Very specific product searches with exact names
- Questions about delivery, payment, or support
- Questions about existing orders
- User is already viewing the interactive list
- Technical support questions`,

  GET_PRODUCT_DETAILS: `Get detailed information about a specific product by its ID.

Use this tool ONLY when:
- The user's LAST message contains a product ID (format: "ID: product_xxx" or similar)
- The user has selected a product from an interactive list
- The user wants to know more details about a specific product they selected

Examples of when to use:
- User message: "Selected: iPhone 15 Pro (ID: product_123)"
- User message: "Pressed: Ver Detalles (ID: product_456)"
- User message: "[user selected: 'MacBook Pro' (ID: product_789) from list]"

CRITICAL RULES:
- ONLY use this tool if the LAST user message contains a product ID
- This tool is for getting details of a SPECIFIC product the user selected
- Use this tool to provide detailed information about the selected product

RESPONSE BEHAVIOR:
- If product data is found: Provide complete information (name, price, currency, description)
- If product data is NOT found: Inform user that information is not available
- NEVER make up or guess product information
- Always be honest about data availability

DO NOT use this tool for:
- General product inquiries (use show_featured_products instead)
- When no product ID is present in the last message
- When user asks about multiple products
- When user asks about categories or general offerings`,

  GET_COMPANY_INFO: `Get company information including website, social media, and contact details.

Use this tool when users ask about:
✅ Company contact information:
- "¿Cuál es su sitio web?"
- "¿Dónde puedo encontrar su página de Facebook?"
- "¿Tienen Instagram?"
- "¿Cuál es su número de teléfono?"
- "¿Cómo puedo contactarlos?"

✅ General company information:
- "¿Dónde están ubicados?"
- "¿Cuál es su dirección?"
- "¿Cómo puedo visitar su página web?"
- "¿Tienen redes sociales?"

✅ Contact and location inquiries:
- "¿Cómo los contacto?"
- "¿Dónde puedo encontrarlos?"
- "¿Tienen oficina física?"
- "¿Cuál es su información de contacto?"

RESPONSE BEHAVIOR:
- If company data is found: Provide complete information (website, social media, phone)
- If company data is NOT found: Inform user that information is not available
- If specific requested information is missing: Inform user that specific data is not currently available
- Always provide accurate information from the configuration
- Include relevant social media links and contact details
- Be honest about what information is available vs. what is not

CRITICAL: When user asks for specific information (e.g., "website", "phone", "address"):
- If the requested information is NOT in the results: Tell user "No contamos con esa información actualmente"
- If the requested information IS in the results: Provide the specific information
- Example: User asks for website, but only phone/email are available → Respond "No contamos con información del sitio web actualmente"

DO NOT use this tool for:
- Product or service inquiries (use show_featured_products instead)
- Technical support questions
- Order or billing questions
- When user asks about specific products`,

  SEARCH_PRODUCTS: `Search for products using semantic similarity (vector search) based on natural language queries.

Use this tool when the user:
- Asks for specific products or services by description or characteristics
- Mentions specific features, types, or categories they're looking for
- Uses natural language to describe what they need (not just general inquiries)
- Wants to find products matching specific criteria

Examples of when to use:
- "Busco un diseño de logo"
- "Necesito una página web"
- "¿Tienen servicios de branding?"
- "Quiero algo para redes sociales"
- "I need a product that does X"
- "Do you have something for Y?"
- "Looking for Z type of service"

This tool uses semantic search to find products that match the user's query meaning,
not just exact word matches. It's perfect for understanding user intent and finding
relevant products even if they don't use the exact product names.

RESPONSE BEHAVIOR:
- If products are found: List the matching products with their names and descriptions
- If no products are found: Inform the user that no matching products were found
- Provide clear information about each product found
- Include product names, descriptions, and suggest using get_product_details for more info

DO NOT use this tool for:
- Very general inquiries like "what do you offer" (use show_featured_products instead)
- When user asks about company contact info (use get_company_info instead)
- When user already selected a product with ID (use get_product_details instead)
- Technical support or order questions`,

  TRANSFER_TO_HUMAN: `Transfer the conversation to a human sales advisor when the LAST user message explicitly requests a human or clearly indicates they are ready to buy.

Use this tool ONLY when the LAST message (not earlier history) shows that the user:
- Asks to speak with a human, agent, or advisor
- Confirms they want to proceed with a purchase or contract a service
- Requests a phone call, meeting, or direct human follow-up
- Expresses intent to finalize the deal and needs human assistance

Examples of when to use:
- "Quiero hablar con un asesor"
- "¿Pueden llamarme para cerrar la compra?"
- "Perfecto, ¿con quién hablo para contratarlo?"
- "Necesito que alguien me contacte para finalizar"
- "Listo, quiero comprarlo, pásame con un humano"

Rules:
- Ignore conversation history; evaluate ONLY the most recent user message
- Only use when the user clearly requests human help or closing steps in that message
- Provide a concise summary of the user's intent in the tool arguments if possible
- After calling this tool, the assistant should acknowledge the handoff and set expectations for the follow-up

Do NOT use when:
- The user is still exploring options or asking for more information
- The user is asking general questions about products or company info
- The intent to buy or speak with a human is ambiguous
- The request for a human only appears in older messages`,
} as const;
