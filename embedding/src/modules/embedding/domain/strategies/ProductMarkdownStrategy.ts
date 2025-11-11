import { ProductEmbedding } from '@modules/embedding/domain/models/Product';
import { MarkdownGenerationStrategy } from './MarkdownGenerationStrategy';

/**
 * Product Markdown Strategy Interface
 *
 * @description
 * Defines the contract for product-specific markdown generation strategies.
 * Extends the base MarkdownGenerationStrategy with ProductEmbedding type.
 */
export interface ProductMarkdownStrategy
  extends MarkdownGenerationStrategy<ProductEmbedding> {
  /**
   * Generates markdown content from a ProductEmbedding entity.
   * @param productEmbedding - The ProductEmbedding entity to generate markdown for.
   * @returns A promise that resolves to the generated markdown string.
   */
  generateMarkdown(productEmbedding: ProductEmbedding): Promise<string>;
}
