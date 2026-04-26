import { useEffect, useState } from 'react'

export function useMediaQuery(query: string): boolean {
  const [value, setValue] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia(query).matches
  })

  useEffect(() => {
    const m = window.matchMedia(query)
    const handler = (e: MediaQueryListEvent) => setValue(e.matches)
    m.addEventListener('change', handler)
    return () => m.removeEventListener('change', handler)
  }, [query])

  return value
}