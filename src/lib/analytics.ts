type AnalyticsEvent =
  | 'audit_started'
  | 'file_uploaded'
  | 'ocr_completed'
  | 'fields_confirmed'
  | 'verdict_viewed'
  | 'gate_viewed'
  | 'cta_clicked'
  | 'payment_initiated'
  | 'payment_completed'
  | 'payment_failed'
  | 'payment_cancelled'
  | 'refund_requested'
  | 'subscription_cancelled'

interface AnalyticsUser {
  userId?: string
  anonId?: string
}

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
    plausible?: (event: string, props?: Record<string, string | number | boolean>) => void
    dataLayer?: unknown[]
  }
}

function getUser(): AnalyticsUser {
  return {}
}

export function trackEvent(event: AnalyticsEvent, properties?: Record<string, string | number | boolean>) {
  const user = getUser()
  const payload = {
    event,
    ...properties,
    timestamp: new Date().toISOString(),
    ...(user.userId && { user_id: user.userId }),
  }

  if (typeof window !== 'undefined') {
    if (window.gtag) {
      window.gtag('event', event, properties)
    }
    if (window.plausible) {
      window.plausible(event, properties ?? {})
    }
  }
}

export function trackPageView(url: string, title: string) {
  if (typeof window !== 'undefined') {
    if (window.gtag) {
      window.gtag('config', process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '', {
        page_location: url,
        page_title: title,
      })
    }
  }
}
