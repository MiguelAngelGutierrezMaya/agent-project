import { ProductMarkdownStrategy } from '@modules/embedding/domain/strategies/ProductMarkdownStrategy';
import { ProductEmbedding } from '@modules/embedding/domain/models/Product';

/**
 * Product Markdown Strategy Implementation
 *
 * @description
 * Infrastructure implementation of ProductMarkdownStrategy.
 * Generates comprehensive markdown content from ProductEmbedding entities including
 * product details, category information, and metadata for enhanced embedding quality.
 */
export class ProductMarkdownStrategyImp implements ProductMarkdownStrategy {
  /**
   * Generates comprehensive markdown content from a ProductEmbedding entity.
   *
   * @param productEmbedding - The ProductEmbedding entity with complete information
   * @returns A promise that resolves to the generated markdown string
   *
   * @description
   * Creates detailed markdown including:
   * - Product basic information (name, type, description)
   * - Category context and description
   * - Pricing information with currency
   * - Detailed specifications
   * - Featured status and embedding status
   * - Additional metadata
   */
  async generateMarkdown(productEmbedding: ProductEmbedding): Promise<string> {
    const { product } = productEmbedding;
    const { name, type, description, details, category } = product;

    let markdown = `# ${name}\n\n`;

    // Product Type and Basic Information
    markdown += `**Product Type:** ${type}\n\n`;

    if (description) {
      markdown += `## Description\n${description}\n\n`;
    }

    // Category Information
    if (category) {
      markdown += `## Category\n`;
      markdown += `**Category:** ${category.name}\n`;
      if (category.description) {
        markdown += `**Category Description:** ${category.description}\n`;
      }
      markdown += '\n';
    }

    // Pricing Information
    if (details) {
      markdown += `## Pricing\n`;
      markdown += `**Price:** ${details.currency} ${details.price}\n`;

      if (details.detailedDescription) {
        markdown += `**Detailed Description:** ${details.detailedDescription}\n`;
      }
      markdown += '\n';
    }

    return markdown.trim();
  }
}
