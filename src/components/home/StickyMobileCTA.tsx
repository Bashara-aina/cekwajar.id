'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export function StickyMobileCTA() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const sentinel = document.getElementById('hero-sentinel')
    if (!sentinel) return
    const obs = new IntersectionObserver(
      ([e]) => setShow(!e.isIntersecting),
      { threshold: 0 }
    )
    obs.observe(sentinel)
    return () => obs.disconnect()
  }, [])

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 p-3 backdrop-blur transition-transform duration-300 sm:hidden ${
        show ? 'translate-y-0' : 'translate-y-full'
      }`}
    >
      <Link
        href="/wajar-slip"
        className="block w-full rounded-lg bg-emerald-600 py-3 text-center text-sm font-semibold text-white"
      >
        Cek Slip Gajiku · 30 detik · Gratis →
      </Link>
    </div>
  )
}
