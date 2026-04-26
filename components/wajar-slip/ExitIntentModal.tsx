'use client'

import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export function ExitIntentModal() {
  const [visible, setVisible] = useState(false)
  const [sessionKey] = useState(() => `cekwajar_exit_${typeof window !== 'undefined' ? window.location.pathname : ''}`)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const stored = sessionStorage.getItem(sessionKey)
    if (stored) return

    let triggered = false
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !triggered) {
        triggered = true
        sessionStorage.setItem(sessionKey, '1')
        setShown(true)
        setVisible(true)
      }
    }
    document.addEventListener('mouseleave', handleMouseLeave)
    return () => document.removeEventListener('mouseleave', handleMouseLeave)
  }, [sessionKey])

  if (!shown || !visible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
        <button
          onClick={() => setVisible(false)}
          className="absolute right-4 top-4 rounded-full p-1 hover:bg-slate-100"
        >
          <X className="h-4 w-4 text-slate-400" />
        </button>
        <h3 className="text-lg font-extrabold text-slate-900">
          Tutup tanpa lihat IDR yang ditahan slip kamu?
        </h3>
        <p className="mt-2 text-sm text-slate-500">
          Verdict kamu menunggu. Salah nominal, bisa dapat kembali.
        </p>
        <div className="mt-5 flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => setVisible(false)}
          >
            Tetap tutup
          </Button>
          <Link href="/upgrade?from=exit-intent" className="flex-1">
            <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
              Lihat dulu · IDR 49K
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}