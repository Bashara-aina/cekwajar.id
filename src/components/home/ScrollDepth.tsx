'use client'
import { useEffect } from 'react'
import { trackEvent } from '@/lib/analytics'

export function ScrollDepth() {
  useEffect(() => {
    const buckets = [25, 50, 75, 100]
    const fired = new Set<number>()

    const onScroll = () => {
      const pct = ((window.scrollY + window.innerHeight) / document.body.scrollHeight) * 100
      buckets.forEach((b) => {
        if (pct >= b && !fired.has(b)) {
          fired.add(b)
          trackEvent('home_scroll_depth', { bucket: b })
        }
      })
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return null
}
