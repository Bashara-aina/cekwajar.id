import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%)',
          fontFamily: 'system-ui',
        }}
      >
        <div
          style={{
            fontSize: 72,
            fontWeight: 900,
            color: '#065f46',
            letterSpacing: '-0.02em',
          }}
        >
          cekwajar.id
        </div>
        <div
          style={{
            fontSize: 28,
            color: '#374151',
            marginTop: 16,
            maxWidth: 800,
            textAlign: 'center',
          }}
        >
          Apakah slip gaji kamu mencuri dari kamu?
        </div>
        <div
          style={{
            fontSize: 20,
            color: '#6b7280',
            marginTop: 12,
          }}
        >
          Audit PPh21 + BPJS · Gratis · Dalam 30 detik
        </div>
      </div>
    ),
    { ...size }
  )
}
