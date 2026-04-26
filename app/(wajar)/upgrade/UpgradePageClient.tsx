'use client'

import { useState, useEffect, useCallback } from 'react'
import { Loader2, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { REVENUE_ANCHORS } from '@/lib/constants'

declare global {
  interface Window {
    snap?: {
      pay: (token: string, options?: Record<string, unknown>) => void
    }
  }
}

export default function UpgradePageClient() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [snapLoaded, setSnapLoaded] = useState(false)

  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY
    const isProd = process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === 'true'
    if (!key) {
      return
    }
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
        onSuccess: () => {
          window.location.href = '/upgrade/success'
        },
        onPending: () => {
          setError('Pembayaran menunggu konfirmasi. Silakan selesaikan pembayaran Anda.')
          setLoading(false)
        },
        onError: () => {
          setError('Pembayaran gagal. Silakan coba metode lain.')
          setLoading(false)
        },
        onClose: () => {
          setLoading(false)
        },
      })
    } catch {
      setError('Tidak terhubung ke server. Cek koneksi internet Anda.')
      setLoading(false)
    }
  }, [])

  return (
    <div className="max-w-lg mx-auto px-4 py-12 space-y-8">
      <div className="text-center">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <ShieldCheck className="w-8 h-8 text-emerald-600" />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">
          Buka detail rupiah yang slip gajimu sembunyikan.
        </h1>
        <p className="mt-3 text-base text-slate-600">
          IDR {REVENUE_ANCHORS.PRO_PRICE_IDR.toLocaleString('id-ID')} / bulan.
          Bulan pertama biasanya kurang dari uang yang kamu temukan.
        </p>
        <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-slate-500">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
          Garansi 7 hari uang kembali · Batalkan kapan saja
        </p>
      </div>

      <div className="rounded-3xl border-2 border-emerald-300 bg-white p-6 shadow-xl shadow-emerald-500/10 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Pro</p>
        <p className="mt-2 text-5xl font-extrabold tracking-tight text-slate-900">
          IDR {REVENUE_ANCHORS.PRO_PRICE_IDR.toLocaleString('id-ID')}
          <span className="ml-1 text-lg font-medium text-slate-500">/ bulan</span>
        </p>
        <p className="mt-2 text-sm text-slate-500">
          Tanpa kontrak. Batalkan dari dashboard kapan saja.
        </p>

        <Button
          onClick={handlePay}
          disabled={loading || !snapLoaded}
          className="mt-6 h-14 w-full bg-emerald-600 text-base font-semibold shadow-md shadow-emerald-500/30 hover:bg-emerald-700"
        >
          {loading ? (
            <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Membuka pembayaran…</>
          ) : !snapLoaded ? (
            <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Memuat…</>
          ) : (
            <>Mulai Pro Sekarang <ArrowRight className="ml-2 h-5 w-5" /></>
          )}
        </Button>

        {error && (
          <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-xs text-red-700" role="alert">
            {error}
          </p>
        )}

        <ul className="mt-5 space-y-1.5 text-xs text-slate-500">
          <li className="flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> Garansi 7 hari uang kembali</li>
          <li className="flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> Pembayaran aman via Midtrans (KTP + NPWP terdaftar)</li>
          <li className="flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> Slip gaji disimpan di Singapore (ap-southeast-1), dihapus 30 hari</li>
        </ul>
      </div>

      <div className="space-y-3">
        <p className="text-center text-sm font-semibold text-slate-700">Yang kamu dapat dengan Pro</p>
        {[
          'Detail rupiah selisih per komponen (PPh21, JHT, JP, JKK, JKM, BPJS Kesehatan)',
          'Skrip langkah ke HRD — apa yang harus dikatakan, dengan referensi peraturan',
          'Riwayat audit lengkap, ekspor PDF untuk dokumentasi',
          'Akses Wajar Gaji P25-P75 per kota dan Wajar Kabur 20 negara',
          'Update otomatis kalo PMK / UMK berubah — kamu tidak ketinggalan',
        ].map((v) => (
          <div key={v} className="flex items-start gap-3 rounded-lg border border-slate-200 bg-white p-4">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              <CheckCircle2 className="h-3 w-3" strokeWidth={3} />
            </span>
            <span className="text-sm text-slate-700">{v}</span>
          </div>
        ))}
      </div>

      <div className="text-center text-sm text-slate-500">
        <p>Pertanyaan? Hubungi <a href="mailto:founder@cekwajar.id" className="text-emerald-600 hover:underline">founder@cekwajar.id</a> — balas dalam 24 jam.</p>
      </div>
    </div>
  )
}