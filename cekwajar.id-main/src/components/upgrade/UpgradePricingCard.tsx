'use client'
import { useEffect, useState } from 'react'
import { Loader2, ShieldCheck, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { REVENUE_ANCHORS } from '@/lib/constants'
import { useRouter, useSearchParams } from 'next/navigation'

export function UpgradePricingCard() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const params = useSearchParams()
  const fromVerdict = params?.get('from') === 'verdict'

  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY
    if (!key) return
    const isProd = process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === 'true'
    const url = isProd ? 'https://app.midtrans.com/snap/snap.js' : 'https://app.sandbox.midtrans.com/snap/snap.js'
    const s = document.createElement('script')
    s.src = url
    s.setAttribute('data-client-key', key)
    s.onerror = () => setError('Tidak bisa memuat sistem pembayaran. Refresh halaman.')
    document.head.appendChild(s)
    return () => { document.head.removeChild(s) }
  }, [])

  const router = useRouter()

  async function handlePay() {
    setError(null); setLoading(true)
    try {
      const res = await fetch('/api/payment/create-transaction', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: 'pro', billingPeriod: 'monthly', source: fromVerdict ? 'verdict' : 'upgrade' }),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        if (res.status === 401) { router.push('/auth/login?next=/upgrade'); return }
        setError(j.error?.message ?? 'Gagal membuat transaksi.')
        return
      }
      const { data } = await res.json()
      const w = window as Window & { snap?: { pay: (t: string, opts: object) => void } }
      if (!w.snap) { setError('Sistem pembayaran belum siap. Refresh halaman.'); return }
      w.snap.pay(data.snapToken, {
        onSuccess: () => { window.location.href = '/upgrade/success' },
        onPending: () => { window.location.href = '/dashboard?payment=pending' },
        onError: () => setError('Pembayaran gagal. Coba metode lain.'),
        onClose: () => setLoading(false),
      })
    } catch {
      setError('Tidak terhubung ke server. Cek koneksi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="px-4 py-12">
      <div className="mx-auto max-w-md">
        <div className="rounded-3xl border-2 border-emerald-300 bg-white p-6 shadow-xl shadow-emerald-500/10 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Pro</p>
          <p className="mt-2 text-5xl font-extrabold tracking-tight text-slate-900 sm:text-6xl">
            IDR {REVENUE_ANCHORS.PRO_PRICE_IDR.toLocaleString('id-ID')}
            <span className="ml-1 text-lg font-medium text-slate-500 sm:text-xl">/ bulan</span>
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Tanpa kontrak. Batalkan dari dashboard kapan saja.
          </p>

          <div className="sticky bottom-[var(--keyboard-h,0)] left-0 right-0 -mx-4 mt-6 border-t border-slate-200 bg-white px-4 py-3 sm:static sm:mx-0 sm:border-0 sm:p-0">
            <Button
              onClick={handlePay}
              disabled={loading}
              className="h-14 w-full bg-emerald-600 text-base font-semibold shadow-md shadow-emerald-500/30 hover:bg-emerald-700 sm:w-auto"
            >
              {loading ? (
                <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Membuka pembayaran…</>
              ) : (
                <>Mulai Pro Sekarang <ArrowRight className="ml-2 h-5 w-5" /></>
              )}
            </Button>
          </div>

          {error && (
            <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>
          )}

          <ul className="mt-5 space-y-1.5 text-xs text-slate-500">
            <li className="flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> Garansi 7 hari uang kembali</li>
            <li className="flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> Pembayaran aman via Midtrans (KTP + NPWP terdaftar)</li>
            <li className="flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> Slip gaji disimpan di Singapore (ap-southeast-1), dihapus 30 hari</li>
          </ul>
        </div>
      </div>
    </section>
  )
}