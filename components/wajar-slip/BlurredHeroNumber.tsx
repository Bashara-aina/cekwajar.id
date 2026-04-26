'use client'

import { useEffect, useRef, useState } from 'react'

interface Props {
  amountIdr: number
  isPaid: boolean
}

export function BlurredHeroNumber({ amountIdr, isPaid }: Props) {
  const [revealed, setRevealed] = useState(false)
  const [displayValue, setDisplayValue] = useState(0)
  const rafRef = useRef<number>(0)
  const startRef = useRef<number>(0)
  const duration = 800

  useEffect(() => {
    if (!isPaid) return
    const id = setTimeout(() => {
      setRevealed(true)
      const start = performance.now()
      startRef.current = start
      const animate = (now: number) => {
        const elapsed = now - startRef.current
        const progress = Math.min(elapsed / duration, 1)
        const eased = 1 - Math.pow(1 - progress, 3)
        setDisplayValue(Math.round(eased * amountIdr))
        if (progress < 1) {
          rafRef.current = requestAnimationFrame(animate)
        }
      }
      rafRef.current = requestAnimationFrame(animate)
    }, 0)
    return () => {
      clearTimeout(id)
      cancelAnimationFrame(rafRef.current)
    }
  }, [isPaid, amountIdr])

  return (
    <div className="text-center">
      <p
        className={`font-mono text-5xl font-extrabold tracking-tight transition-all duration-700 sm:text-6xl ${
          isPaid
            ? revealed
              ? 'text-red-700'
              : 'text-slate-900 blur-md'
            : 'select-none text-slate-900 blur-md'
        }`}
        aria-label={isPaid ? `Selisih ${amountIdr} rupiah` : 'Selisih tertutup, klik untuk buka'}
      >
        IDR {isPaid ? displayValue.toLocaleString('id-ID') : amountIdr.toLocaleString('id-ID')}
      </p>
      <p className="mt-1 text-xs uppercase tracking-wider text-slate-500">Total selisih bulan ini</p>
    </div>
  )
}