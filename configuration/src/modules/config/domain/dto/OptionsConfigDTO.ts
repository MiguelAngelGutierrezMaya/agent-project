import { DomainValidationError } from '@src/infrastructure/shared/utils/errors/domain';
import { OptionsConfig } from '@modules/config/domain/models/OptionsConfig';

/**
 * Options Config DTO
 *
 * @description
 * Data Transfer Object for options configuration with flexible JSON fields.
 * Handles validation and transformation of options config data.
 */
export class OptionsConfigDTO {
  constructor(
    public readonly id: string,
    public readonly configData: Record<string, unknown>,
    public readonly companyInformation: Record<string, unknown>,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  static create(
    data: Record<string, string | Date | Record<string, unknown>>
  ): [OptionsConfigDTO?, DomainValidationError?] {
    const { id, configData, companyInformation, createdAt, updatedAt } = data;

    if (!id || !createdAt || !updatedAt) {
      return [
        undefined,
        new DomainValidationError(
          'Invalid options config data: id, createdAt, and updatedAt are required'
        ),
      ];
    }

    // Validate configData (optional, defaults to empty object)
    const validatedConfigData =
      configData && typeof configData === 'object'
        ? (configData as Record<string, unknown>)
        : {};

    // Validate companyInformation (optional, defaults to empty object)
    const validatedCompanyInformation =
      companyInformation && typeof companyInformation === 'object'
        ? (companyInformation as Record<string, unknown>)
        : {};

    return [
      new OptionsConfigDTO(
        id as string,
        validatedConfigData,
        validatedCompanyInformation,
        createdAt as Date,
        updatedAt as Date
      ),
      undefined,
    ];
  }

  public toDomain(): OptionsConfig {
    return {
      id: this.id,
      configData: this.configData,
      companyInformation: this.companyInformation,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
