import type { Config } from '@modules/config/domain/models/Config';
import { DomainValidationError } from '@src/infrastructure/shared/utils/errors/domain';
import { AiConfigDTO } from './AiConfigDTO';
import { OptionsConfigDTO } from './OptionsConfigDTO';
import { SocialConfigDTO } from './SocialConfigDTO';
import { BillingDTO } from './BillingDTO';
import {
  BillingCurrencyType,
  BillingStatusType,
} from '@modules/config/domain/models/Billing';

export class ConfigDTO {
  constructor(
    public readonly id: string,
    public readonly botName: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly optionsConfig: OptionsConfigDTO,
    public readonly socialConfig: SocialConfigDTO,
    public readonly aiConfig: AiConfigDTO,
    public readonly billing: BillingDTO
  ) {}

  static create(
    data: Record<string, string | number | boolean | Date | object>
  ): [ConfigDTO?, DomainValidationError?] {
    const {
      id,
      botName,
      createdAt,
      updatedAt,
      optionsConfig,
      socialConfig,
      aiConfig,
      billing,
    } = data;

    if (
      !id ||
      !botName ||
      !createdAt ||
      !updatedAt ||
      !optionsConfig ||
      !socialConfig ||
      !aiConfig ||
      !billing
    ) {
      return [undefined, new DomainValidationError('Invalid data')];
    }

    const [optionsConfigDTO, optionsConfigError] = OptionsConfigDTO.create(
      optionsConfig as Record<string, string | Date | Record<string, unknown>>
    );

    if (optionsConfigError) {
      return [undefined, optionsConfigError];
    }

    const [socialConfigDTO, socialConfigError] = SocialConfigDTO.create(
      socialConfig as Record<string, string | Date>
    );

    if (socialConfigError) {
      return [undefined, socialConfigError];
    }

    const [aiConfigDTO, aiConfigError] = AiConfigDTO.create(
      aiConfig as Record<string, string | number | Date>
    );

    if (aiConfigError) {
      return [undefined, aiConfigError];
    }

    const [billingDTO, billingError] = BillingDTO.create(
      billing as Record<
        string,
        BillingCurrencyType | number | BillingStatusType | Date
      >
    );

    if (billingError) {
      return [undefined, billingError];
    }

    if (!optionsConfigDTO || !socialConfigDTO || !aiConfigDTO || !billingDTO) {
      return [undefined, new DomainValidationError('Invalid data')];
    }

    return [
      new ConfigDTO(
        id as string,
        botName as string,
        createdAt as Date,
        updatedAt as Date,
        optionsConfigDTO,
        socialConfigDTO,
        aiConfigDTO,
        billingDTO
      ),
      undefined,
    ];
  }

  public toDomain(): Config {
    return {
      id: this.id,
      botName: this.botName,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      optionsConfig: this.optionsConfig.toDomain(),
      socialConfig: this.socialConfig.toDomain(),
      aiConfig: this.aiConfig.toDomain(),
      billing: this.billing.toDomain(),
    };
  }
}
