import { useCallback, useEffect, useMemo, useState } from 'react';

import type { BotConfiguration } from '@/modules/Config/presentation/components/types';

interface UseGeneralTabProps {
  config: BotConfiguration;
  setConfig: (config: BotConfiguration) => void;
}

/**
 * Custom hook for GeneralTab component logic
 * Manages company information fields with stable IDs for React rendering
 */
export const useGeneralTab = ({ config, setConfig }: UseGeneralTabProps) => {
  // Track stable IDs for company fields to prevent React re-rendering on key changes
  // Map structure: id -> key (reverse mapping for stability)
  const [fieldIdMap, setFieldIdMap] = useState<Map<string, string>>(new Map());

  // Initialize ID map when config changes from outside
  useEffect(() => {
    const currentKeys = Object.keys(config.companyInformation);
    setFieldIdMap(prev => {
      const newMap = new Map(prev);

      // Add new fields that don't have IDs yet
      currentKeys.forEach(key => {
        // Check if this key already has a mapping (search by value)
        const hasMapping = Array.from(newMap.values()).includes(key);
        if (!hasMapping) {
          // Generate a stable ID using the current timestamp
          const newId = `field_${Date.now()}_${Math.random()}`;
          newMap.set(newId, key);
        }
      });

      // Remove IDs for deleted fields
      newMap.forEach((_key, id) => {
        if (!currentKeys.includes(_key)) {
          newMap.delete(id);
        }
      });

      return newMap;
    });
  }, [config.companyInformation]);

  // Convert Record to array of objects with stable IDs for React rendering
  // Use the fieldIdMap order to preserve field position
  const companyFields = useMemo(() => {
    return Array.from(fieldIdMap.entries())
      .map(([id, key]) => {
        const value = config.companyInformation[key];
        if (value === undefined) return null; // Skip deleted fields
        return {
          id,
          key,
          value: value as string,
        };
      })
      .filter(field => field !== null) as Array<{
      id: string;
      key: string;
      value: string;
    }>;
  }, [config.companyInformation, fieldIdMap]);

  /**
   * Update company field value
   */
  const updateCompanyField = useCallback(
    (id: string, value: string) => {
      const field = companyFields.find(f => f.id === id);
      if (!field) return;

      setConfig({
        ...config,
        companyInformation: {
          ...config.companyInformation,
          [field.key]: value,
        },
      });
    },
    [config, companyFields, setConfig]
  );

  /**
   * Update company field key
   */
  const updateCompanyFieldKey = useCallback(
    (id: string, newKey: string) => {
      const field = companyFields.find(f => f.id === id);
      if (!field) return;

      // If key hasn't changed, do nothing
      if (field.key === newKey) return;

      const { [field.key]: value, ...rest } = config.companyInformation;

      // Update the ID map to map the ID to the new key
      setFieldIdMap(prev => {
        const newMap = new Map(prev);
        // ID stays the same, just update the key it points to
        newMap.set(id, newKey);
        return newMap;
      });

      setConfig({
        ...config,
        companyInformation: {
          ...rest,
          [newKey]: value,
        },
      });
    },
    [config, companyFields, setConfig]
  );

  /**
   * Remove company field
   */
  const removeCompanyField = useCallback(
    (id: string) => {
      const field = companyFields.find(f => f.id === id);
      if (!field) return;

      const rest = Object.fromEntries(
        Object.entries(config.companyInformation).filter(
          ([k]) => k !== field.key
        )
      );
      setConfig({
        ...config,
        companyInformation: rest,
      });
    },
    [config, companyFields, setConfig]
  );

  /**
   * Add new company field
   */
  const addCompanyField = useCallback(() => {
    const key = `custom_${Date.now()}`;
    setConfig({
      ...config,
      companyInformation: {
        ...config.companyInformation,
        [key]: '',
      },
    });
  }, [config, setConfig]);

  return {
    companyFields,
    updateCompanyField,
    updateCompanyFieldKey,
    removeCompanyField,
    addCompanyField,
  };
};
