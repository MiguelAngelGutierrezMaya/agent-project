import { useAuth } from '@clerk/clerk-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { BillingStatus } from '@/modules/Config/domain/models/Billing';
import type { ConfigWithSchema } from '@/modules/Config/domain/models/Config';
import { useConfigService } from '@/modules/Config/infrastructure/hooks/useConfigService';
import { NO_BILLING_ROUTES } from '@/modules/shared/presentation/router';

interface BillingValidationResult {
  isValid: boolean;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Hook to validate user billing status
 * Checks if the user has a valid paid subscription for the current month
 *
 * @returns BillingValidationResult with validation status, loading state, and error
 */
export const useBillingValidation = (): BillingValidationResult => {
  const { userId } = useAuth();
  const location = useLocation();
  const { configService, getGetConfigRequest } = useConfigService();
  const [isValid, setIsValid] = useState<boolean>(true); // Default to valid to prevent blocking
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const configServiceRef = useRef(configService);
  const getGetConfigRequestRef = useRef(getGetConfigRequest);

  useEffect(() => {
    configServiceRef.current = configService;
    getGetConfigRequestRef.current = getGetConfigRequest;
  }, [configService, getGetConfigRequest]);

  /**
   * Validate billing status from configuration
   */
  const validateBilling = useCallback(async () => {
    if (NO_BILLING_ROUTES.includes(location.pathname)) {
      return;
    }

    if (!userId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const request = await getGetConfigRequestRef.current();
      const config: ConfigWithSchema =
        await configServiceRef.current.getConfig(request);

      // Check if billing status is PAID
      if (config.billing.status !== BillingStatus.PAID) {
        setIsValid(false);
        setIsLoading(false);
        return;
      }

      // Check if the payment is from the current month
      const paymentDate = new Date(config.billing.createdAt);
      const currentDate = new Date();

      const isCurrentMonth =
        paymentDate.getFullYear() === currentDate.getFullYear() &&
        paymentDate.getMonth() === currentDate.getMonth();

      setIsValid(isCurrentMonth);
    } catch (err) {
      console.error('Error validating billing:', err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
      // On error, default to valid to prevent blocking legitimate users
      setIsValid(true);
    } finally {
      setIsLoading(false);
    }
  }, [userId, location.pathname]);

  useEffect(() => {
    validateBilling();
  }, [validateBilling]);

  return {
    isValid,
    isLoading,
    error,
  };
};
