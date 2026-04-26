'use client'

import { useState, useEffect, useCallback } from 'react'
import { Loader2, ShieldCheck, ArrowRight, CheckCircle2, X, TrendingUp, Lock, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { REVENUE_ANCHORS } from '@/lib/constants'
import Link from 'next/link'

declare global {
  interface Window {
    snap?: {
      pay: (token: string, options?: Record<string, unknown>) => void
    }
  }
}

const PRO_FEATURES = [
  {
    title: 'Detail rupiah selisih per komponen',
    desc: 'PPh21, JHT, JP, JKK, JKM, BPJS Kesehatan — angka pastinya, bukan hanya "ada pelanggaran".',
  },
  {
    title: 'Skrip langkah ke HRD',
    desc: 'Apa yang harus kamu katakan, bagaimana cara mengatakannya, dengan referensi pasal hukum yang spesifik.',
  },
  {
    title: 'Riwayat audit + ekspor PDF',
    desc: 'Semua audit tersimpan di akunmu. Export PDF profesional untuk dokumentasi atau bukti.',
  },
  {
    title: 'Benchmark gaji pasar P25–P90',
    desc: 'Lihat rentang gaji P25, P50, P75, P90 untuk posisi dan kota kamu. Data dari BPS dan kontribusi komunitas.',
  },
  {
    title: 'Wajar Kabur: 20+ negara',
    desc: 'Perbandingan daya beli internasional berbasis PPP. Apakah pindah ke negara lain benar-benar worth it?',
  },
  {
    title: 'Update otomatis PMK & UMK',
    desc: 'Setiap perubahan regulasi langsung diupdate. Kamu tidak perlu lagi cek manual.',
  },
]

const FREE_VS_PRO = [
  { feature: 'Ada/tidak pelanggaran', free: true, pro: true },
  { feature: 'Jumlah pelanggaran', free: true, pro: true },
  { feature: 'Detail rupiah per komponen', free: false, pro: true },
  { feature: 'Skrip ke HRD + referensi hukum', free: false, pro: true },
  { feature: 'Riwayat audit & ekspor PDF', free: false, pro: true },
  { feature: 'Benchmark gaji P25–P90', free: false, pro: true },
  { feature: 'Wajar Kabur 20+ negara', free: false, pro: true },
  { feature: 'Update otomatis regulasi', free: false, pro: true },
]

function UrgencyPulse() {
  const [count, setCount] = useState<number | null>(null)
  useEffect(() => {
    fetch('/api/stats/recent-payments')
      .then((r) => r.json())
      .then((d) => setCount(d.lastHour ?? null))
      .catch(() => {})
  }, [])
  if (!count || count < 3) return null
  return (
    <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500 mb-4">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
      </span>
      <strong className="text-slate-700">{count} orang</strong> baru upgrade dalam 1 jam terakhir
    </div>
  )
}

export default function UpgradePageClient() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [snapLoaded, setSnapLoaded] = useState(false)

  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY
    const isProd = process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === 'true'
    if (!key) return
    const url = isProd
      ? 'https://app.midtrans.com/snap/snap.js'
      : 'https://app.sandbox.midtrans.com/snap/snap.js'
    const script = document.createElement('script')
    script.src = url
    script.setAttribute('data-client-key', key)
    script.async = true
    script.onload = () => setSnapLoaded(true)
    script.onerror = () => setError('Tidak bisa memuat sistem pembayaran. Refresh halaman.')
    document.body.appendChild(script)
    return () => {
      if (document.body.contains(script)) document.body.removeChild(script)
    }
  }, [])

  const handlePay = useCallback(async () => {
    setError(null)
    setLoading(true)
    try {
      const res = await fetch('/api/midtrans/snap-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: `guest_${Date.now()}`,
          tier: 'pro',
          billingPeriod: 'monthly',
          source: 'upgrade',
        }),
      })

      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        if (res.status === 401) {
          window.location.href = '/auth/login?next=/upgrade'
          return
        }
        setError(j.error?.message ?? 'Gagal membuat transaksi pembayaran.')
        setLoading(false)
        return
      }

      const { token } = await res.json()

      if (!window.snap) {
        setError('Sistem pembayaran belum siap. Silakan refresh halaman.')
        setLoading(false)
        return
      }

      window.snap.pay(token, {
        onSuccess: () => { window.location.href = '/upgrade/success' },
        onPending: () => {
          setError('Pembayaran menunggu konfirmasi. Silakan selesaikan pembayaran Anda.')
          setLoading(false)
        },
        onError: () => {
          setError('Pembayaran gagal. Silakan coba metode lain.')
          setLoading(false)
        },
        onClose: () => { setLoading(false) },
      })
    } catch {
      setError('Tidak terhubung ke server. Cek koneksi internet Anda.')
      setLoading(false)
    }
  }, [])

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 sm:py-14 space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700 uppercase tracking-wider mb-4">
          <Sparkles className="h-3 w-3" />
          Harga Early Bird — Rp {(REVENUE_ANCHORS.PRO_PRICE_IDR / 1000).toFixed(0)}K / bulan
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 sm:text-3xl leading-tight">
          Buka berapa rupiah yang<br className="hidden sm:block" /> slip gajimu sembunyikan.
        </h1>
        <p className="mt-3 text-slate-600">
          Rata-rata pengguna Pro menemukan{' '}
          <strong className="text-slate-900">
            IDR {REVENUE_ANCHORS.AVG_SHORTFALL_IDR.toLocaleString('id-ID')}
          </strong>{' '}
          — 17× lipat biaya berlangganan. Bulan pertama sudah balik modal.
        </p>
      </div>

      {/* ROI calc */}
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 flex items-start gap-3">
        <TrendingUp className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
        <div className="text-sm text-emerald-900">
          <strong>Math sederhana:</strong> Rp {Math.round(REVENUE_ANCHORS.AVG_SHORTFALL_IDR / 1000)}K avg recovery ÷ Rp {REVENUE_ANCHORS.PRO_PRICE_IDR / 1000}K/bulan =
          <strong className="text-emerald-700"> 17× ROI bulan pertama.</strong>
          <span className="block mt-0.5 text-xs text-emerald-700">Kalau tidak ada pelanggaran? Refund 100% dalam 24 jam. Tanpa pertanyaan.</span>
        </div>
      </div>

      {/* Payment card */}
      <div className="rounded-3xl border-2 border-emerald-400 bg-white p-6 shadow-2xl shadow-emerald-500/15 sm:p-8">
        <div className="flex items-center justify-between mb-1">
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-600">Pro</p>
          <span className="rounded-full bg-emerald-600 px-2.5 py-0.5 text-[10px] font-bold text-white uppercase">
            Paling Populer
          </span>
        </div>
        <div className="flex items-baseline gap-2">
          <p className="text-5xl font-extrabold tracking-tight text-slate-900">
            IDR {(REVENUE_ANCHORS.PRO_PRICE_IDR / 1000).toFixed(0)}K
          </p>
          <p className="text-slate-500">/ bulan</p>
        </div>
        <p className="mt-0.5 text-xs text-slate-400">Tanpa kontrak · Batalkan kapan saja dari dashboard</p>

        <UrgencyPulse />

        <Button
          onClick={handlePay}
          disabled={loading || !snapLoaded}
          className="mt-4 h-14 w-full bg-emerald-600 text-base font-bold shadow-lg shadow-emerald-500/30 hover:bg-emerald-700"
        >
          {loading ? (
            <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Membuka pembayaran…</>
          ) : !snapLoaded ? (
            <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Memuat sistem pembayaran…</>
          ) : (
            <>Mulai Pro Sekarang · Rp {(REVENUE_ANCHORS.PRO_PRICE_IDR / 1000).toFixed(0)}K <ArrowRight className="ml-2 h-5 w-5" /></>
          )}
        </Button>

        {error && (
          <p className="mt-3 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700" role="alert">
            {error}
          </p>
        )}

        {/* Trust signals */}
        <div className="mt-5 grid grid-cols-3 gap-2 text-center text-[11px] text-slate-500">
          <div className="flex flex-col items-center gap-1">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            Garansi 7 hari
          </div>
          <div className="flex flex-col items-center gap-1">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            Midtrans aman
          </div>
          <div className="flex flex-col items-center gap-1">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            Data terenkripsi
          </div>
        </div>
      </div>

      {/* Feature detail */}
      <div>
        <p className="text-sm font-bold text-slate-700 mb-3">Yang kamu dapatkan dengan Pro:</p>
        <div className="space-y-2.5">
          {PRO_FEATURES.map((f) => (
            <div
              key={f.title}
              className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4"
            >
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100">
                <CheckCircle2 className="h-3 w-3 text-emerald-600" strokeWidth={3} />
              </span>
              <div>
                <p className="text-sm font-semibold text-slate-800">{f.title}</p>
                <p className="mt-0.5 text-xs text-slate-500">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Free vs Pro comparison */}
      <div>
        <p className="text-sm font-bold text-slate-700 mb-3">Perbandingan Free vs Pro:</p>
        <div className="overflow-hidden rounded-xl border border-slate-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500">Fitur</th>
                <th className="px-3 py-2.5 text-center text-xs font-semibold text-slate-500">Gratis</th>
                <th className="px-3 py-2.5 text-center text-xs font-bold text-emerald-600">Pro</th>
              </tr>
            </thead>
            <tbody>
              {FREE_VS_PRO.map((row, i) => (
                <tr
                  key={row.feature}
                  className={`border-b border-slate-100 last:border-0 ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}
                >
                  <td className="px-4 py-2.5 text-xs text-slate-700">{row.feature}</td>
                  <td className="px-3 py-2.5 text-center">
                    {row.free ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 mx-auto" />
                    ) : (
                      <X className="h-4 w-4 text-slate-300 mx-auto" />
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    {row.pro ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 mx-auto" strokeWidth={2.5} />
                    ) : (
                      <X className="h-4 w-4 text-slate-300 mx-auto" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Locked preview */}
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
        <div className="flex items-start gap-3">
          <Lock className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-amber-900">Yang kamu lihat sekarang (Free):</p>
            <p className="mt-1 text-sm text-amber-800">
              Ada <strong>3 pelanggaran</strong> ditemukan di slip gajimu. Total selisih:{' '}
              <span className="font-mono font-bold blur-sm select-none">IDR ███.███</span>
            </p>
            <p className="mt-2 text-xs text-amber-700">
              ↑ Upgrade Pro untuk lihat angka pastinya + cara mendapatkan uangnya kembali.
            </p>
          </div>
        </div>
      </div>

      {/* Second CTA */}
      <div className="text-center">
        <Button
          onClick={handlePay}
          disabled={loading || !snapLoaded}
          className="h-13 bg-emerald-600 px-8 font-bold text-base shadow-lg shadow-emerald-500/30 hover:bg-emerald-700"
        >
          {loading ? (
            <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Memproses…</>
          ) : (
            <>Mulai Pro · IDR {(REVENUE_ANCHORS.PRO_PRICE_IDR / 1000).toFixed(0)}K/bulan <ArrowRight className="ml-1.5 h-4 w-4" /></>
          )}
        </Button>
        <p className="mt-2 text-xs text-slate-400">Garansi 7 hari · Batalkan kapan saja · Midtrans aman</p>
      </div>

      {/* Footer */}
      <div className="text-center space-y-1 text-sm text-slate-500">
        <p>
          Pertanyaan? Email{' '}
          <a href="mailto:founder@cekwajar.id" className="text-emerald-600 hover:underline">
            founder@cekwajar.id
          </a>{' '}
          — founder baca dan balas sendiri dalam 24 jam.
        </p>
        <p>
          <Link href="/slip" className="text-slate-400 hover:text-emerald-600 text-xs underline">
            Kembali ke audit gratis →
          </Link>
        </p>
      </div>
    </div>
  )
}
