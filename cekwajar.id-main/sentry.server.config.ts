import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Higher trace rate for server to catch issues
  tracesSampleRate: 0.2,

  // Ignore noisy expected errors
  ignoreErrors: [
    'MidtransError',
    'ValidationError',
    'AuthApiError',
    'PostgrestError',
    // Expected user errors
    'rate_limit_exceeded',
    'quota_exceeded',
    'invalid_payslip_format',
    // Auth errors that are handled by middleware
    'unauthorized',
    'session_refresh_failed',
  ],

  // Strip sensitive data
  beforeSend(event) {
    if (event.user) {
      delete event.user.email
      delete event.user.username
    }
    // Remove any stack traces that might contain env var names
    if (event.exception?.values) {
      for (const exc of event.exception.values) {
        if (exc.stacktrace?.frames) {
          for (const frame of exc.stacktrace.frames) {
            // Clean any variables that might be sensitive
            if (frame.vars) {
              for (const key of Object.keys(frame.vars)) {
                if (key.toLowerCase().includes('key') || key.toLowerCase().includes('secret') || key.toLowerCase().includes('password')) {
                  delete frame.vars[key]
                }
              }
            }
          }
        }
      }
    }
    return event
  },

  environment: process.env.NODE_ENV,

  debug: process.env.NODE_ENV === 'development',
})

export default Sentry