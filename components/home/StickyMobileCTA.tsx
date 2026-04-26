'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, ShieldCheck } from 'lucide-react'

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
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 px-3 py-3 backdrop-blur-md transition-transform duration-300 sm:hidden ${
        show ? 'translate-y-0' : 'translate-y-full'
      }`}
    >
      <Link
        href="/slip"
        className="flex items-center justify-center gap-2 w-full rounded-xl bg-emerald-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-500/25 active:bg-emerald-700"
      >
        Cek Slip Gajiku — Gratis
        <ArrowRight className="h-4 w-4" />
      </Link>
      <p className="mt-1.5 flex items-center justify-center gap-1 text-[10px] text-muted-foreground">
        <ShieldCheck className="h-3 w-3 text-emerald-600" />
        Tanpa daftar · 30 detik · Garansi 7 hari
      </p>
    </div>
  )
}
