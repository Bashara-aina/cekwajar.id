export type EventName =
  | 'page_view'
  | 'audit_started'
  | 'verdict_shown'
  | 'gate_shown'
  | 'upgrade_clicked'
  | 'payment_success'
  | 'signup_completed'
  | 'referral_shared'

interface EventProps {
  [key: string]: string | number | boolean | undefined
}

export function track(event: EventName, props?: EventProps) {
  if (process.env.NODE_ENV === 'test') return
  const payload = {
    event,
    timestamp: new Date().toISOString(),
    ...props,
  }
  if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
    navigator.sendBeacon('/api/analytics', JSON.stringify(payload))
  }
}