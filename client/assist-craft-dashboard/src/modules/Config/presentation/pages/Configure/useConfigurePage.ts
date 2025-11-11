import { useAuth } from '@clerk/clerk-react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { useToast } from '@/hooks/use-toast';
import type { ConfigWithSchema } from '@/modules/Config/domain/models/Config';
import {
  transformBackendToUI,
  transformUIToBackend,
} from '@/modules/Config/domain/transformers/ConfigTransformers';
import { useConfigService } from '@/modules/Config/infrastructure/hooks/useConfigService';
import type { BotConfiguration } from '@/modules/Config/presentation/components/types';
import { useTranslation } from '@/modules/shared/presentation/hooks/useTranslation';

/**
 * Custom hook for Configure Page logic
 * Manages configuration state, loading, saving, and validation
 */
export const useConfigurePage = () => {
  const { userId } = useAuth();
  const { configService, getGetConfigRequest, getUpdateConfigRequest } =
    useConfigService();
  const { toast } = useToast();
  const { t } = useTranslation();

  // Use refs to keep stable references to functions
  const toastRef = useRef(toast);
  const tRef = useRef(t);

  // Update refs on change
  useEffect(() => {
    toastRef.current = toast;
    tRef.current = t;
  }, [toast, t]);

  const [config, setConfig] = useState<BotConfiguration | null>(null);
  const [originalConfig, setOriginalConfig] = useState<ConfigWithSchema | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hasChanges, setHasChanges] = useState(false);

  /**
   * Load configuration from API with cache support
   */
  const loadConfig = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);
      const request = await getGetConfigRequest();
      const backendConfig = await configService.getConfig(request);

      setOriginalConfig(backendConfig);
      const uiConfig = transformBackendToUI(backendConfig);
      setConfig(uiConfig);
      setHasChanges(false);
      setErrors({});
    } catch (error) {
      console.error('Error loading config:', error);
      toastRef.current({
        title: tRef.current('configuration.errors.loadError'),
        description: tRef.current('configuration.errors.loadErrorDescription'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [userId, configService, getGetConfigRequest]);

  /**
   * Load configuration on mount
   */
  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  /**
   * Validate configuration form fields
   * @returns true if valid, false otherwise
   */
  const validateConfig = useCallback((): boolean => {
    if (!config) return false;

    const newErrors: Record<string, string> = {};

    if (!config.botName.trim()) {
      newErrors.botName = tRef.current(
        'configuration.validation.botNameRequired'
      );
    }

    Object.entries(config.companyInformation).forEach(([key, value]) => {
      if (!value.trim()) {
        newErrors[`companyInformation.${key}`] = tRef.current(
          'configuration.validation.fieldRequired'
        );
      }
    });

    if (!config.whatsappNumber.trim()) {
      newErrors.whatsappNumber = tRef.current(
        'configuration.validation.whatsappNumberRequired'
      );
    }

    if (!config.whatsappAccessToken.trim()) {
      newErrors.whatsappAccessToken = tRef.current(
        'configuration.validation.accessTokenRequired'
      );
    }

    if (!config.whatsappBusinessPhoneId.trim()) {
      newErrors.whatsappBusinessPhoneId = tRef.current(
        'configuration.validation.phoneIdRequired'
      );
    }

    if (!config.whatsappDisplayPhone.trim()) {
      newErrors.whatsappDisplayPhone = tRef.current(
        'configuration.validation.displayPhoneRequired'
      );
    }

    if (!config.facebookEndpoint.trim()) {
      newErrors.facebookEndpoint = tRef.current(
        'configuration.validation.endpointRequired'
      );
    }

    if (!config.whatsappApiVersion.trim()) {
      newErrors.whatsappApiVersion = tRef.current(
        'configuration.validation.apiVersionRequired'
      );
    }

    if (!config.facebookPageUrl.trim()) {
      newErrors.facebookPageUrl = tRef.current(
        'configuration.validation.facebookUrlRequired'
      );
    }

    if (!config.instagramPageUrl.trim()) {
      newErrors.instagramPageUrl = tRef.current(
        'configuration.validation.instagramUrlRequired'
      );
    }

    if (!config.whatsappListDescription.trim()) {
      newErrors.whatsappListDescription = tRef.current(
        'configuration.validation.listDescriptionRequired'
      );
    }

    if (!config.whatsappButtonOptionsTitle.trim()) {
      newErrors.whatsappButtonOptionsTitle = tRef.current(
        'configuration.validation.buttonTitleRequired'
      );
    }

    if (!config.chatModel.trim()) {
      newErrors.chatModel = tRef.current(
        'configuration.validation.chatModelRequired'
      );
    }

    if (!config.embeddingModel.trim()) {
      newErrors.embeddingModel = tRef.current(
        'configuration.validation.embeddingModelRequired'
      );
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [config]);

  /**
   * Save configuration to API
   */
  const handleSave = useCallback(async () => {
    if (!config || !originalConfig) return;

    if (!validateConfig()) {
      toastRef.current({
        title: tRef.current('configuration.validation.validationError'),
        description: tRef.current('configuration.validation.fixErrors'),
        variant: 'destructive',
      });
      return;
    }

    try {
      setSaving(true);
      const backendConfig = transformUIToBackend(config, originalConfig);
      const request = await getUpdateConfigRequest(backendConfig);
      const updatedConfig = await configService.updateConfig(request);

      setOriginalConfig(updatedConfig);
      const uiConfig = transformBackendToUI(updatedConfig);
      setConfig(uiConfig);
      setHasChanges(false);

      toastRef.current({
        title: tRef.current('success.saved'),
        description: '',
      });
    } catch (error) {
      console.error('Error saving config:', error);
      toastRef.current({
        title: tRef.current('configuration.errors.saveError'),
        description: tRef.current('configuration.errors.saveErrorDescription'),
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  }, [
    config,
    originalConfig,
    validateConfig,
    getUpdateConfigRequest,
    configService,
  ]);

  /**
   * Handle configuration changes from form inputs
   */
  const handleConfigChange: React.Dispatch<
    React.SetStateAction<BotConfiguration>
  > = useCallback(
    value => {
      if (!config) return;
      if (typeof value === 'function') {
        setConfig(prev => {
          const currentConfig = prev || config;
          return value(currentConfig);
        });
      } else {
        setConfig(value);
      }
      setHasChanges(true);
      setErrors({});
    },
    [config]
  );

  return {
    config,
    loading,
    saving,
    errors,
    hasChanges,
    handleSave,
    handleConfigChange,
  };
};
