/**
 * Options configuration interface with flexible JSON fields
 *
 * @description
 * Represents bot options configuration with flexible JSON fields
 * for better scalability and company-specific configurations.
 *
 * Fields:
 * - configData: Flexible configuration data (e.g., show_products, visit_website, human_support)
 * - companyInformation: Company-specific information (e.g., business_hours, address, contact_details)
 */
export interface OptionsConfig {
  /** Unique options config identifier */
  id: string;
  /** Flexible configuration data as JSON object */
  configData: Record<string, unknown>;
  /** Company-specific information as JSON object */
  companyInformation: Record<string, unknown>;
  /** Configuration creation timestamp */
  createdAt: Date;
  /** Configuration last update timestamp */
  updatedAt: Date;
}
