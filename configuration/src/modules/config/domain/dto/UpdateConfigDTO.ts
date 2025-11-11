import { DomainValidationError } from '@src/infrastructure/shared/utils/errors/domain';
import { AiConfigDTO } from './AiConfigDTO';
import { OptionsConfigDTO } from './OptionsConfigDTO';
import { SocialConfigDTO } from './SocialConfigDTO';
import { ConfigDTO } from './ConfigDTO';
import { BillingDTO } from './BillingDTO';

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
