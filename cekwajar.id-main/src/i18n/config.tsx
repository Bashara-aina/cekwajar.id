// ══════════════════════════════════════════════════════════════════════════════
// cekwajar.id — i18n configuration
// Simple locale context provider — no next-intl dependency required
// ══════════════════════════════════════════════════════════════════════════════

import { createContext, useContext, type ReactNode } from 'react'
import idTranslations from '@/locales/id.json'

export type Locale = 'id'

export const LOCALES: Locale[] = ['id']

const translations: Record<Locale, Record<string, unknown>> = {
  id: idTranslations,
}

export const LocaleContext = createContext<Locale>('id')

interface LocaleProviderProps {
  children: ReactNode
  locale?: Locale
}

export function LocaleProvider({ children, locale = 'id' }: LocaleProviderProps) {
  return (
    <LocaleContext.Provider value={locale}>
      {children}
    </LocaleContext.Provider>
  )
}

export function getTranslations(locale: Locale): Record<string, unknown> {
  return translations[locale] ?? translations.id
}