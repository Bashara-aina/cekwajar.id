import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Instrument server-side operations
  tracesSampleRate: 0.3,

  // Performance monitoring

  environment: process.env.NODE_ENV,

  debug: process.env.NODE_ENV === 'development',
})

export default Sentry

// Export error handler for use in API routes
export const captureException = Sentry.captureException.bind(Sentry)