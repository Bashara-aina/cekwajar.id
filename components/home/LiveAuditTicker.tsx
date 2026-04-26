'use client'
import { useEffect, useState } from 'react'
import { createBrowserClient } from '@/lib/supabase/client'

interface Item {
  id: string
  created_at: string
  shortfall_display: string
  first_name_only: string
  city: string
}

function formatRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (minutes < 1) return 'beberapa detik lalu'
  if (minutes < 60) return `${minutes} menit yang lalu`
  if (hours < 24) return `${hours} jam yang lalu`
  return `${days} hari yang lalu`
}

export function LiveAuditTicker({ className = '' }: { className?: string }) {
  const [items, setItems] = useState<Item[]>([])
  useEffect(() => {
    async function load() {
      try {
        const sb = createBrowserClient()
        const { data } = await sb.from('recent_audits_public').select('*').limit(20)
        setItems((data ?? []) as Item[])
      } catch {
        // silently fail — ticker is optional
      }
    }
    load()
  }, [])

  if (!items.length) return null

  return (
    <div
      className={`relative overflow-hidden rounded-full border border-emerald-200/60 bg-emerald-50/50 py-2 ${className}`}
    >
      <div className="ticker flex animate-marquee whitespace-nowrap text-xs text-slate-700">
        {[...items, ...items].map((i, idx) => (
          <span key={`${i.id}-${idx}`} className="px-6">
            <span className="text-slate-400">
              {formatRelativeTime(i.created_at)}
            </span>
            {' · '}
            <strong className="text-slate-900">{i.first_name_only}</strong> di{' '}
            {i.city} →{' '}
            <span className="font-semibold text-emerald-700">
              {i.shortfall_display}
            </span>
          </span>
        ))}
      </div>
    </div>
  )
}
