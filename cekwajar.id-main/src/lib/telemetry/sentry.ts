// ══════════════════════════════════════════════════════════════════════════════
// cekwajar.id — Sentry Telemetry Setup
// Initializes Sentry for error tracking and performance monitoring
// ══════════════════════════════════════════════════════════════════════════════

import * as Sentry from '@sentry/nextjs'

const DSN = process.env.NEXT_PUBLIC_SENTRY_DSN

/**
 * Initialize Sentry if DSN is configured.
 * Call once at app startup (next.config.js or instrument.ts).
 */
export function initSentry(): void {
  if (!DSN) {
    return
  }

  Sentry.init({
    dsn: DSN,
    environment: process.env.NODE_ENV ?? 'development',

    // 10% of transactions for performance monitoring (cheap at scale)
    tracesSampleRate: 0.1,

    // Always capture replay on errors in production
    replaysOnErrorSampleRate: 1.0,

    // Ignore common browser noise
    ignoreErrors: [
      'NetworkError when attempting to fetch resource.',
      'Failed to load resource',
      'net::ERR_',
    ],

    // Tag transactions by Wajar feature for filtering
    beforeSend(event) {
      if (event.transaction && event.tags) {
        const match = event.transaction.match(/\/(slip|gaji|kabur|tanah|hidup)/)
        if (match) {
          event.tags.feature = match[1]
        }
      }
      return event
    },
  })
}

/**
 * Wrapper to capture exceptions in API routes with request context.
 * Use with try/catch or as a higher-order handler.
 */
export function captureError(
  error: unknown,
  context?: { path?: string; method?: string; userId?: string }
): void {
  if (!DSN) return

  Sentry.captureException(error, {
    extra: {
      path: context?.path,
      method: context?.method,
      userId: context?.userId,
    },
  })
}