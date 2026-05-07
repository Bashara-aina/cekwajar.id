// cekwajar.id — OG Share Image for verdict
// GET /wajar-slip/share/[id] — renders a shareable OG image (1200x630)
// Supports both light and dark mode via ?theme= query param

import { ImageResponse } from 'next/og'
import { getServiceClient } from '@/lib/supabase/server'

export const runtime = 'edge'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

interface ShareCardData {
  shortfall_idr: number | null
  violation_count: number | null
  city: string | null
  masked_first_name: string | null
}

const LIGHT = {
  bgGradientStart: '#fff5f5',
  bgGradientEnd: '#fee2e2',
  brandText: '#dc2626',
  heading: '#7f1d1d',
  amount: '#dc2626',
  subtext: '#9f1239',
  footer: '#6b7280',
  muted: '#64748b',
  shieldBg: '#1B65A6',
}

const DARK = {
  bgGradientStart: '#0f172a',
  bgGradientEnd: '#1e293b',
  brandText: '#fb7185',
  heading: '#fecdd3',
  amount: '#f87171',
  subtext: '#fda4af',
  footer: '#94a3b8',
  muted: '#94a3b8',
  shieldBg: '#2B7CC9',
}

export default async function OG({
  params,
  searchParams,
}: {
  params: { id: string }
  searchParams: Promise<{ theme?: string }>
}) {
  const sb = await getServiceClient()
  const resolved = await searchParams
  const isDark = resolved?.theme === 'dark'

  const { data } = await sb
    .from('payslip_audits')
    .select('shortfall_idr, violation_count, city, masked_first_name')
    .eq('id', params.id)
    .single()

  const typed = data as ShareCardData | null
  const shortfall = typed?.shortfall_idr ?? 0
  const hasFindings = shortfall > 0

  const display = hasFindings
    ? `IDR ${Number(shortfall).toLocaleString('id-ID')}`
    : 'IDR ███.███'
  const name = typed?.masked_first_name ?? 'Anonim'
  const city = typed?.city ?? 'Indonesia'
  const c = isDark ? DARK : LIGHT

  const verdictColor = hasFindings ? c.amount : isDark ? '#22c55e' : '#16A34A'
  const verdictLabel = hasFindings ? 'Potongan tidak wajar' : 'Slip gaji wajar'

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          padding: '80px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background:
            'linear-gradient(135deg,' +
            c.bgGradientStart +
            ' 0%,' +
            c.bgGradientEnd +
            ' 100%)',
          fontFamily: 'Inter, system-ui, sans-serif',
        }}
      >
        {/* Top bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5L12 2z"
              fill={c.shieldBg}
            />
            <path
              d="M9 12l2 2 4-4"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span style={{ fontSize: '22px', color: c.brandText, letterSpacing: '0.1em', fontWeight: 600 }}>
            cekwajar.id
          </span>
          <span style={{ color: c.muted, fontSize: '18px' }}>·</span>
          <span style={{ color: c.muted, fontSize: '18px' }}>audit slip gaji</span>
        </div>

        {/* Center verdict area */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ fontSize: '28px', color: c.heading }}>
            {name[0]?.toUpperCase()}{name.slice(1)} di {city}
          </div>

          {/* Verdict badge */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: isDark ? verdictColor + '22' : verdictColor + '15',
              borderRadius: '999px',
              padding: '6px 16px',
              width: 'fit-content',
              marginTop: '4px',
            }}
          >
            <div
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: verdictColor,
              }}
            />
            <span style={{ fontSize: '18px', color: verdictColor, fontWeight: 600 }}>
              {verdictLabel}
            </span>
          </div>

          <div
            style={{
              fontSize: '96px',
              fontWeight: 800,
              color: verdictColor,
              lineHeight: '1',
              letterSpacing: '-2px',
            }}
          >
            {display}
          </div>

          <div style={{ fontSize: '26px', color: c.subtext }}>
            {hasFindings ? 'yang seharusnya jadi miliknya.' : '— tidak ada pelanggaran ditemukan.'}
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '20px', color: c.footer }}>
            Cek slip gajimu sendiri di cekwajar.id
          </span>
          <span style={{ fontSize: '18px', color: c.muted }}>30 detik · gratis</span>
        </div>
      </div>
    ),
    { ...size }
  )
}