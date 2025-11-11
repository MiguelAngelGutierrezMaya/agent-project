import { DocumentEmbedding } from '@modules/embedding/domain/models/Document';
import { MarkdownGenerationStrategy } from './MarkdownGenerationStrategy';

/**
 * Document Markdown Strategy Interface
 *
 * @description
 * Defines the contract for document-specific markdown generation strategies.
 * Extends the base MarkdownGenerationStrategy with DocumentEmbedding type.
 */
export interface DocumentMarkdownStrategy
  extends MarkdownGenerationStrategy<DocumentEmbedding> {
  /**
   * Generates markdown content from a DocumentEmbedding entity.
   * @param documentEmbedding - The DocumentEmbedding entity to generate markdown for.
   * @returns A promise that resolves to the generated markdown string.
   */
  generateMarkdown(documentEmbedding: DocumentEmbedding): Promise<string>;
}
