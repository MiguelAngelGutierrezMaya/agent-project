export enum BillingStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  CANCELLED = 'cancelled',
}

export type BillingStatusType =
  (typeof BillingStatus)[keyof typeof BillingStatus];

export enum BillingCurrency {
  USD = 'USD',
  COP = 'COP',
}

export type BillingCurrencyType =
  (typeof BillingCurrency)[keyof typeof BillingCurrency];

export interface Billing {
  currency: BillingCurrencyType;
  amount: number;
  status: BillingStatusType;
  createdAt: Date;
  updatedAt: Date;
}
