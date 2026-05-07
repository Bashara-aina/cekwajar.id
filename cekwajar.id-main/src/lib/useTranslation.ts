'use client';

/**
 * Lightweight i18n hook for Indonesian locale.
 * Uses JSON locale files directly without next-intl dependency.
 */

import idLocale from '@/locales/id.json';

type LocaleStrings = typeof idLocale;

const translations: Record<string, LocaleStrings> = {
  id: idLocale,
};

const defaultLocale = 'id';

/**
 * Retrieves nested translation value by dot-notation key.
 * Example: t('nav.masuk') returns "Masuk"
 */
export function t(key: string): string {
  const locale = translations[defaultLocale] ?? translations[defaultLocale];
  const keys = key.split('.');
  let result: unknown = locale;

  for (const k of keys) {
    if (result && typeof result === 'object' && k in result) {
      result = (result as Record<string, unknown>)[k];
    } else {
      return key;
    }
  }

  return typeof result === 'string' ? result : key;
}

/**
 * Hook for accessing translation function in React components.
 * Returns the t function bound to the current locale.
 */
export function useTranslation() {
  return { t };
}
