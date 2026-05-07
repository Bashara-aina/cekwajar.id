// ══════════════════════════════════════════════════════════════════════════════
// cekwajar.id — useTranslations hook
// Flat key path access to nested locale strings
// Usage: t('nav.tools.wajar-slip') returns "Wajar Slip"
//        t('home.hero.title') returns "Slip gajimu mencuri dari kamu?"
// ══════════════════════════════════════════════════════════════════════════════

'use client'

import { useContext } from 'react'
import { LocaleContext, getTranslations, type Locale } from '@/i18n/config'

type FlatTranslations = Record<string, string | ((args?: Record<string, string | number>) => string)>

function getNestedValue(obj: Record<string, unknown>, path: string): string | undefined {
  const keys = path.split('.')
  let current: unknown = obj

  for (const key of keys) {
    if (current === null || current === undefined || typeof current !== 'object') {
      return undefined
    }
    current = (current as Record<string, unknown>)[key]
  }

  if (typeof current === 'string') {
    return current
  }
  return undefined
}

function buildFlatMap(locale: Locale): FlatTranslations {
  const translations = getTranslations(locale)
  const flat: FlatTranslations = {}

  function flatten(
    obj: Record<string, unknown>,
    prefix: string,
  ): void {
    for (const key of Object.keys(obj)) {
      const value = obj[key]
      const fullKey = prefix ? `${prefix}.${key}` : key

      if (typeof value === 'string') {
        flat[fullKey] = value
      } else if (typeof value === 'object' && value !== null) {
        flatten(value as Record<string, unknown>, fullKey)
      }
    }
  }

  flatten(translations as Record<string, unknown>, '')
  return flat
}

// Cache flat maps per locale
const flatMapCache: Record<string, FlatTranslations> = {}

function getFlatMap(locale: Locale): FlatTranslations {
  if (!flatMapCache[locale]) {
    flatMapCache[locale] = buildFlatMap(locale)
  }
  return flatMapCache[locale]
}

export function useTranslations() {
  const locale = useContext(LocaleContext)
  const flatMap = getFlatMap(locale)

  function t(
    key: string,
    args?: Record<string, string | number>,
  ): string {
    const template = flatMap[key]
    if (!template) {
      return key // fallback to key itself if translation missing
    }

    if (typeof template === 'function') {
      return template(args)
    }

    if (args) {
      // Simple {placeholder} interpolation
      return template.replace(/\{(\w+)\}/g, (_, k) =>
        String(args[k] ?? `{${k}}`),
      )
    }

    return template
  }

  return { t, locale }
}

export type { Locale }