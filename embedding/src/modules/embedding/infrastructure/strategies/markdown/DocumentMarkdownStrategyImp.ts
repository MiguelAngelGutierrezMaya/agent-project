import { DocumentMarkdownStrategy } from '@modules/embedding/domain/strategies/DocumentMarkdownStrategy';
import { DocumentEmbedding } from '@modules/embedding/domain/models/Document';

/**
 * Document Markdown Strategy Implementation
 *
 * @description
 * Infrastructure implementation of DocumentMarkdownStrategy.
 * Generates markdown content from DocumentEmbedding entities.
 */
export class DocumentMarkdownStrategyImp implements DocumentMarkdownStrategy {
  /**
   * Generates markdown content from a DocumentEmbedding entity.
   * @param documentEmbedding - The DocumentEmbedding entity.
   * @returns A promise that resolves to the generated markdown string.
   */
  async generateMarkdown(
    documentEmbedding: DocumentEmbedding
  ): Promise<string> {
    const { document } = documentEmbedding;
    const { name, url, type } = document;

    let markdown = `# ${name}\n\n`;

    if (url) {
      markdown += `**URL:** ${url}\n\n`;
    }

    if (type) {
      markdown += `**Type:** ${type}\n\n`;
    }

    return markdown.trim();
  }
}
