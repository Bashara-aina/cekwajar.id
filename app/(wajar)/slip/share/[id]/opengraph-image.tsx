import { ImageResponse } from 'next/og'
import { supabaseAdmin } from '@/lib/supabase/server'

export const runtime = 'edge'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function OG({ params }: { params: { id: string } }) {
  let shortfallDisplay = 'IDR ███.███'
  let city = 'Indonesia'
  let name = 'Anonim'

  try {
    const { data } = await supabaseAdmin
      .from('payslip_audits')
      .select('shortfall_idr, violation_count, city, masked_first_name')
      .eq('id', params.id)
      .single()

    if (data) {
      shortfallDisplay = data.shortfall_idr
        ? `IDR ${data.shortfall_idr.toLocaleString('id-ID')}`
        : 'IDR ███.███'
      city = data.city ?? city
      name = data.masked_first_name ?? name
    }
  } catch {
    // keep defaults
  }

  return new ImageResponse(
    <div style={{
      height: '100%', width: '100%', padding: 80, display: 'flex',
      flexDirection: 'column', justifyContent: 'space-between',
      background: 'linear-gradient(135deg,#fff5f5 0%,#fee2e2 100%)',
    }}>
      <div style={{ fontSize: 24, color: '#dc2626', letterSpacing: 4, textTransform: 'uppercase' }}>
        cekwajar.id · audit slip gaji
      </div>
      <div>
        <div style={{ fontSize: 38, color: '#7f1d1d' }}>
          {name} di {city} menemukan
        </div>
        <div style={{ fontSize: 110, fontWeight: 800, color: '#dc2626', lineHeight: 1 }}>
          {shortfallDisplay}
        </div>
        <div style={{ fontSize: 30, color: '#9f1239' }}>
          yang seharusnya jadi miliknya.
        </div>
      </div>
      <div style={{ fontSize: 22, color: '#6b7280' }}>
        Cek slip gajimu sendiri di cekwajar.id · 30 detik · gratis
      </div>
    </div>,
    { ...size },
  )
}