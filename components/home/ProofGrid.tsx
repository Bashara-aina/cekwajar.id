'use client'

import { useEffect, useRef, useState } from 'react'
import { TrendingUp, Users, AlertTriangle } from 'lucide-react'
import { REVENUE_ANCHORS } from '@/lib/constants'

function useCountUp(target: number, duration = 1800, start = false) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    if (!start) return
    let startTime: number | null = null
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.floor(eased * target))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [target, duration, start])
  return value
}

interface StatItem {
  icon: React.ElementType
  value: number
  format: (n: number) => string
  label: string
  sub: string
  color: string
  bg: string
}

const STATS: StatItem[] = [
  {
    icon: Users,
    value: 12847,
    format: (n) => n.toLocaleString('id-ID'),
    label: 'Slip diaudit',
    sub: 'dan terus bertambah setiap hari',
    color: 'text-emerald-700',
    bg: 'bg-emerald-50',
  },
  {
    icon: AlertTriangle,
    value: 67,
    format: (n) => `${n}%`,
    label: 'Menemukan pelanggaran',
    sub: 'dari slip yang masuk ke platform',
    color: 'text-red-600',
    bg: 'bg-red-50',
  },
  {
    icon: TrendingUp,
    value: Math.round(REVENUE_ANCHORS.AVG_SHORTFALL_IDR / 1000),
    format: (n) => `IDR ${n}K`,
    label: 'Rata-rata ditemukan',
    sub: 'per pengguna yang upgrade ke Pro',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
  },
]

export function ProofGrid() {
  const ref = useRef<HTMLDivElement>(null)
  const [triggered, setTriggered] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTriggered(true)
          obs.disconnect()
        }
      },
      { threshold: 0.3 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <div ref={ref} className="grid gap-4 sm:grid-cols-3">
      {STATS.map((s) => (
        <StatCard key={s.label} stat={s} triggered={triggered} />
      ))}
    </div>
  )
}

function StatCard({ stat, triggered }: { stat: StatItem; triggered: boolean }) {
  const count = useCountUp(stat.value, 1800, triggered)
  const Icon = stat.icon

  return (
    <div className={`rounded-2xl ${stat.bg} p-5 sm:p-6 text-center`}>
      <div className={`mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm`}>
        <Icon className={`h-5 w-5 ${stat.color}`} />
      </div>
      <p className={`text-3xl font-extrabold sm:text-4xl ${stat.color}`}>
        {triggered ? stat.format(count) : stat.format(0)}
      </p>
      <p className="mt-1.5 text-sm font-semibold text-slate-800">{stat.label}</p>
      <p className="mt-0.5 text-xs text-slate-500">{stat.sub}</p>
    </div>
  )
}
