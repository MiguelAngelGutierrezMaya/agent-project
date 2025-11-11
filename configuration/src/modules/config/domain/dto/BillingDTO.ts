import { DomainValidationError } from '@src/infrastructure/shared/utils/errors/domain';
import {
  Billing,
  BillingCurrencyType,
  BillingStatusType,
} from '@modules/config/domain/models/Billing';

export class BillingDTO {
  constructor(
    public readonly currency: BillingCurrencyType,
    public readonly amount: number,
    public readonly status: BillingStatusType,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  static create(
    data: Record<
      string,
      BillingCurrencyType | number | BillingStatusType | Date
    >
  ): [BillingDTO?, DomainValidationError?] {
    const { currency, amount, status, createdAt, updatedAt } = data;

    if (!currency || !amount || !status || !createdAt || !updatedAt) {
      return [undefined, new DomainValidationError('Invalid billing data')];
    }

    return [
      new BillingDTO(
        currency as BillingCurrencyType,
        amount as number,
        status as BillingStatusType,
        createdAt as Date,
        updatedAt as Date
      ),
      undefined,
    ];
  }

  public toDomain(): Billing {
    return {
      currency: this.currency,
      amount: this.amount,
      status: this.status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
