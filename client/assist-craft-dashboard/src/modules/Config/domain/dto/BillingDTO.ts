import type {
  Billing,
  BillingCurrencyType,
  BillingStatusType,
} from '@/modules/Config/domain/models/Billing';
import { DomainValidationError } from '@/modules/shared/domain/errors/DomainValidationError';

/**
 * Billing Configuration DTO
 */
export class BillingDTO {
  constructor(
    public readonly currency: BillingCurrencyType,
    public readonly amount: number,
    public readonly status: BillingStatusType,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  /**
   * Create DTO from raw data
   * @param data - Raw billing data
   * @returns Tuple of [DTO?, Error?]
   */
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

  /**
   * Convert DTO to domain model
   * @returns Billing domain model
   */
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
