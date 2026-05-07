import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Only send errors, not performance transactions in early launch
  tracesSampleRate: 0.1,

  // Ignore known noisy errors
  ignoreErrors: [
    'MidtransError',
    'ValidationError',
    'AuthApiError',
    'PostgrestError',
    'TimeoutError',
    'AbortError',
    'NetworkError',
    // Supabase JS client errors that are handled gracefully
    'user_not_found',
    'invalid_grant',
    'session_expired',
  ],

  // Strip sensitive data from errors
  beforeSend(event) {
    // Remove any extra PII that might have slipped in
    if (event.user) {
      delete event.user.email
      delete event.user.username
    }
    return event
  },

  environment: process.env.NODE_ENV,

  // Enable debug mode locally only
  debug: process.env.NODE_ENV === 'development',
})

export default Sentry