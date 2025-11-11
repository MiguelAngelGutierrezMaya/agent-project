import type { AiConfigDTO } from '@/modules/Config/domain/dto/AiConfigDTO';
import type { BillingDTO } from '@/modules/Config/domain/dto/BillingDTO';
import { ConfigDTO } from '@/modules/Config/domain/dto/ConfigDTO';
import type { OptionsConfigDTO } from '@/modules/Config/domain/dto/OptionsConfigDTO';
import type { SocialConfigDTO } from '@/modules/Config/domain/dto/SocialConfigDTO';
import { DomainValidationError } from '@/modules/shared/domain/errors/DomainValidationError';

/**
 * Update Config DTO
 */
export class UpdateConfigDTO extends ConfigDTO {
  constructor(
    public readonly userId: string,
    override readonly id: string,
    override readonly botName: string,
    override readonly createdAt: Date,
    override readonly updatedAt: Date,
    override readonly optionsConfig: OptionsConfigDTO,
    override readonly socialConfig: SocialConfigDTO,
    override readonly aiConfig: AiConfigDTO,
    override readonly billing: BillingDTO
  ) {
    super(
      id,
      botName,
      createdAt,
      updatedAt,
      optionsConfig,
      socialConfig,
      aiConfig,
      billing
    );
  }

  /**
   * Create DTO from data
   * @param data Raw data with userId
   * @returns Tuple of [DTO?, Error?]
   */
  static override create(
    data: Record<string, string | object>
  ): [UpdateConfigDTO?, DomainValidationError?] {
    const { userId, ...configData } = data;

    if (!userId) {
      return [undefined, new DomainValidationError('User ID is required')];
    }

    const [configDTO, error] = ConfigDTO.create(configData);

    if (error) {
      return [undefined, error];
    }

    if (!configDTO) {
      return [undefined, new DomainValidationError('Invalid data')];
    }

    return [
      new UpdateConfigDTO(
        userId as string,
        configDTO.id,
        configDTO.botName,
        configDTO.createdAt,
        configDTO.updatedAt,
        configDTO.optionsConfig,
        configDTO.socialConfig,
        configDTO.aiConfig,
        configDTO.billing
      ),
      undefined,
    ];
  }
}
