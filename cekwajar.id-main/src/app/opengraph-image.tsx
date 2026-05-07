// ══════════════════════════════════════════════════════════════════════════════
// cekwajar.id — Dynamic OpenGraph Image
// Regenerates automatically when REVENUE_ANCHORS change.
// Must export: alt, size, contentType, runtime, default function.
// ══════════════════════════════════════════════════════════════════════════════

import { ImageResponse } from 'next/og'
import { REVENUE_ANCHORS } from '@/lib/constants'

export const alt = 'cekwajar.id — Cek apakah slip gajimu mencuri dari kamu'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const runtime = 'edge'

export default async function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: 'linear-gradient(135deg, #fffbeb 0%, #ffffff 60%, #ecfdf5 100%)',
          padding: 80,
          fontFamily: 'sans-serif',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ fontSize: 24, color: '#10b981', letterSpacing: 4, textTransform: 'uppercase' }}>
          cekwajar.id
        </div>
        <div>
          <div style={{ fontSize: 76, fontWeight: 800, lineHeight: 1.05, color: '#0f172a' }}>
            Slip gajimu mencuri{'\n'}dari kamu?
          </div>
          <div style={{ marginTop: 24, fontSize: 32, color: '#475569' }}>
            Rata-rata pengguna menemukan{' '}
            <span style={{ fontWeight: 700, color: '#10b981' }}>
              IDR {REVENUE_ANCHORS.AVG_SHORTFALL_IDR.toLocaleString('id-ID')}
            </span>{' '}
            dalam 30 detik.
          </div>
        </div>
        <div style={{ fontSize: 22, color: '#94a3b8' }}>
          PMK 168/2023 · BPJS · Kemnaker UMK 2026 · Gratis
        </div>
      </div>
    ),
    { ...size }
  )
}