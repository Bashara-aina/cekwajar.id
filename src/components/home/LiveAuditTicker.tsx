'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface AuditItem {
  id: string
  created_at: string
  shortfall_display: string
  first_name_only: string
  city: string
}

export function LiveAuditTicker({ className = '' }: { className?: string }) {
  const [items, setItems] = useState<AuditItem[]>([])

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('recent_audits_public')
      .select('*')
      .limit(20)
      .then(({ data }) => setItems((data as AuditItem[]) || []))
  }, [])

  if (!items.length) return null

  return (
    <div className={`relative overflow-hidden rounded-full border border-emerald-200/60 bg-emerald-50/50 py-2 ${className}`}>
      <div className="ticker flex animate-marquee whitespace-nowrap text-xs text-slate-700">
        {[...items, ...items].map((item, idx) => (
          <span key={`${item.id}-${idx}`} className="px-6">
            <span className="text-slate-400">{item.first_name_only}</span> di {item.city} →{' '}
            <span className="font-semibold text-emerald-700">{item.shortfall_display}</span>
          </span>
        ))}
      </div>
    </div>
  )
}