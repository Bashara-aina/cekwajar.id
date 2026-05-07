import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  tracesSampleRate: 0.1,

  ignoreErrors: [
    'MidtransError',
    'rate_limit_exceeded',
    'unauthorized',
    'session_refresh_failed',
  ],

  environment: process.env.NODE_ENV,
})

export default Sentry