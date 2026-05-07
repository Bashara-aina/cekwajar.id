// ══════════════════════════════════════════════════════════════════════════════
// cekwajar.id — LiveAuditTicker Component
// Scrolling feed of recent audits (last 24h), de-identified.
// Falls back to seed data when Supabase view is empty (Day 1).
// ══════════════════════════════════════════════════════════════════════════════

'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatDistanceToNow } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'

interface AuditItem {
  id: string
  created_at: string
  shortfall_display: string
  first_name_only: string
  city: string
  is_seed?: boolean
}

// Seed rows for Day 1 when no real audits exist yet
const SEED_ITEMS: AuditItem[] = [
  { id: 'seed-1', created_at: new Date(Date.now() - 3 * 60_000).toISOString(), shortfall_display: 'IDR 1.124K', first_name_only: 'Andi', city: 'Bekasi', is_seed: true },
  { id: 'seed-2', created_at: new Date(Date.now() - 11 * 60_000).toISOString(), shortfall_display: 'IDR 847K', first_name_only: 'Rina', city: 'Jakarta', is_seed: true },
  { id: 'seed-3', created_at: new Date(Date.now() - 23 * 60_000).toISOString(), shortfall_display: 'tidak ada selisih signifikan', first_name_only: 'Budi', city: 'Surabaya', is_seed: true },
  { id: 'seed-4', created_at: new Date(Date.now() - 47 * 60_000).toISOString(), shortfall_display: 'IDR 432K', first_name_only: 'Siti', city: 'Bandung', is_seed: true },
  { id: 'seed-5', created_at: new Date(Date.now() - 68 * 60_000).toISOString(), shortfall_display: 'IDR 1.050K', first_name_only: 'Joko', city: 'Semarang', is_seed: true },
  { id: 'seed-6', created_at: new Date(Date.now() - 90 * 60_000).toISOString(), shortfall_display: 'IDR 210K', first_name_only: 'Dewi', city: 'Yogyakarta', is_seed: true },
  { id: 'seed-7', created_at: new Date(Date.now() - 2.5 * 3600_000).toISOString(), shortfall_display: 'tidak ada selisih signifikan', first_name_only: 'Ahmad', city: 'Medan', is_seed: true },
  { id: 'seed-8', created_at: new Date(Date.now() - 5 * 3600_000).toISOString(), shortfall_display: 'IDR 678K', first_name_only: 'Lisa', city: 'Makassar', is_seed: true },
]

export function LiveAuditTicker({ className = '' }: { className?: string }) {
  const [items, setItems] = useState<AuditItem[]>([])

  useEffect(() => {
    const sb = createClient()
    sb
      .from('recent_audits_public')
      .select('*')
      .limit(20)
      .then(({ data }) => {
        if (data && data.length > 0) {
          setItems(data as AuditItem[])
        } else {
          // Fall back to seed data when no real audits exist yet
          setItems(SEED_ITEMS)
        }
      })
  }, [])

  if (!items.length) return null

  // Duplicate items for seamless infinite scroll
  const tickerItems = [...items, ...items]

  return (
    <div className={`relative overflow-hidden rounded-full border border-primary-200/60 bg-primary-50/50 py-2 ${className}`}>
      <div className="ticker flex animate-marquee whitespace-nowrap text-xs text-slate-700">
        {tickerItems.map((item, idx) => (
          <span key={`${item.id}-${idx}`} className="px-6">
            <span className="text-slate-500">
              {formatDistanceToNow(new Date(item.created_at), { locale: idLocale, addSuffix: true })}
            </span>
            {' · '}
            <strong className="text-slate-900">{item.first_name_only}</strong> di {item.city} →{' '}
            <span className="font-semibold text-primary-700">{item.shortfall_display}</span>
            {item.is_seed && <span className="ml-1 text-slate-500">(contoh)</span>}
          </span>
        ))}
      </div>
    </div>
  )
}