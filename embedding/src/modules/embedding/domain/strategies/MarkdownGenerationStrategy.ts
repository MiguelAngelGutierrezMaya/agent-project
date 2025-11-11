/**
 * Base Markdown Generation Strategy Interface
 *
 * @description
 * Abstract base interface for markdown generation strategies.
 * Defines the common contract for all markdown generation implementations.
 *
 * @template T - The type of entity this strategy handles
 */
export interface MarkdownGenerationStrategy<T> {
  /**
   * Generates markdown content from a given entity.
   * @param entity - The entity of type T to generate markdown for.
   * @returns A promise that resolves to the generated markdown string.
   */
  generateMarkdown(entity: T): Promise<string>;
}
