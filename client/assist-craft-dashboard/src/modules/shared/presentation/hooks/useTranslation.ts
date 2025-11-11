import { useTranslation as useI18nTranslation } from 'react-i18next';

import type { TranslationKeys } from '@/modules/shared/presentation/i18n/locales/en';

type NestedKeyOf<T> = T extends object
  ? {
      [K in keyof T]: K extends string
        ? T[K] extends object
          ? `${K}.${NestedKeyOf<T[K]>}`
          : K
        : never;
    }[keyof T]
  : never;

export type TranslationPath = NestedKeyOf<TranslationKeys>;

export const useTranslation = () => {
  const { t, i18n } = useI18nTranslation();

  const changeLanguage = (language: string) => {
    i18n.changeLanguage(language);
  };

  const getCurrentLanguage = () => {
    return i18n.language;
  };

  const getAvailableLanguages = () => {
    return [
      { code: 'en', name: 'English', flag: '🇺🇸' },
      { code: 'es', name: 'Español', flag: '🇪🇸' },
    ];
  };

  const translate = (
    key: TranslationPath,
    options?: Record<string, unknown>
  ) => {
    return t(key, options);
  };

  return {
    t: translate,
    changeLanguage,
    getCurrentLanguage,
    getAvailableLanguages,
    isReady: i18n.isInitialized,
  };
};
