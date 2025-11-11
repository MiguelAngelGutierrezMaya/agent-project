import { CompanyModification } from '@modules/embedding/domain/models/CompanyModification';
import { EmbeddingConfig } from '@modules/embedding/domain/models/EmbeddingConfig';

/**
 * Pending Modification with Configuration
 *
 * @description
 * Combines pending modification with AI configuration for embedding processing.
 * This interface is used when processing modifications that require embedding generation.
 */
export interface PendingModificationWithConfig {
  /**
   * Company modification data containing table and schema information
   */
  modification: CompanyModification;

  /**
   * AI configuration for the schema containing model settings
   */
  config: EmbeddingConfig;
}
