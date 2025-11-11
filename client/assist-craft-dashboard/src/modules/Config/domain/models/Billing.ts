/**
 * Billing status enumeration
 * Based on PostgreSQL schema billing.status values
 */
export enum BillingStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  CANCELLED = 'cancelled',
}

export type BillingStatusType =
  (typeof BillingStatus)[keyof typeof BillingStatus];

/**
 * Billing currency enumeration
 */
export enum BillingCurrency {
  USD = 'USD',
  COP = 'COP',
}

export type BillingCurrencyType =
  (typeof BillingCurrency)[keyof typeof BillingCurrency];

/**
 * Billing configuration interface
 */
export interface Billing {
  /** Currency type for billing */
  currency: BillingCurrencyType;
  /** Billing amount */
  amount: number;
  /** Billing status */
  status: BillingStatusType;
  /** Record creation timestamp */
  createdAt: Date;
  /** Last update timestamp */
  updatedAt: Date;
}
