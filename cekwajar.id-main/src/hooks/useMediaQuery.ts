import { useEffect, useState } from 'react'

export function useMediaQuery(q: string) {
  const [v, setV] = useState(false)
  useEffect(() => {
    const m = window.matchMedia(q)
    setV(m.matches)
    const h = (e: MediaQueryListEvent) => setV(e.matches)
    m.addEventListener('change', h)
    return () => m.removeEventListener('change', h)
  }, [q])
  return v
}