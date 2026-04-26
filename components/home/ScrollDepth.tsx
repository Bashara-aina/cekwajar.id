'use client'
import { useEffect } from 'react'

// Wire to GA4 or PostHog when ready
function track(event: string, params: Record<string, number | string>) {
  if (typeof window !== 'undefined' && typeof (window as unknown as Record<string, unknown>).gtag === 'function') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(window as any).gtag('event', event, params)
  }
}

export function ScrollDepth() {
  useEffect(() => {
    const buckets = [25, 50, 75, 100]
    const fired = new Set<number>()
    const onScroll = () => {
      const pct = ((window.scrollY + window.innerHeight) / document.body.scrollHeight) * 100
      buckets.forEach((b) => {
        if (pct >= b && !fired.has(b)) {
          fired.add(b)
          track('home_scroll_depth', { bucket: b })
        }
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  return null
}
