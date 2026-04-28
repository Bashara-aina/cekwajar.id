'use client'
import { useEffect, useState } from 'react'
import { Loader2, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter, useSearchParams } from 'next/navigation'

export function UpgradeFinalCta() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const params = useSearchParams()
  const fromVerdict = params?.get('from') === 'verdict'
  const router = useRouter()

  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY
    if (!key) return
    const isProd = process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === 'true'
    const url = isProd ? 'https://app.midtrans.com/snap/snap.js' : 'https://app.sandbox.midtrans.com/snap/snap.js'
    const s = document.createElement('script')
    s.src = url
    s.setAttribute('data-client-key', key)
    s.onerror = () => setError('Tidak bisa memuat sistem pembayaran.')
    document.head.appendChild(s)
    return () => { document.head.removeChild(s) }
  }, [])

  async function handlePay() {
    setError(null)
    setLoading(true)
    try {
      const res = await fetch('/api/payment/create-transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planType: 'pro', billingPeriod: 'monthly', source: fromVerdict ? 'verdict' : 'upgrade' }),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        if (res.status === 401) { router.push('/auth/login?next=/upgrade'); return }
        setError(j.error?.message ?? 'Gagal membuat transaksi.')
        return
      }
      const { data } = await res.json()
      const w = window as Window & { snap?: { pay: (t: string, opts: object) => void } }
      if (!w.snap) { setError('Sistem pembayaran belum siap.'); return }
      w.snap.pay(data.snapToken, {
        onSuccess: () => { window.location.href = '/upgrade/success' },
        onPending: () => { window.location.href = '/dashboard?payment=pending' },
        onError: () => setError('Pembayaran gagal.'),
        onClose: () => setLoading(false),
      })
    } catch {
      setError('Tidak terhubung ke server.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="bg-emerald-600 px-4 py-16 text-center">
      <div className="mx-auto max-w-md">
        <h2 className="text-2xl font-extrabold text-white sm:text-3xl">
          30 detik dari sini sampai detail rupiah slip kamu.
        </h2>
        <p className="mt-2 text-emerald-100">
          Bulan pertama biasanya kurang dari uang yang kamu temukan.
        </p>
        <Button
          onClick={handlePay}
          disabled={loading}
          className="mt-6 h-14 w-full bg-white text-emerald-700 hover:bg-emerald-50 text-base font-semibold"
        >
          {loading ? (
            <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Membuka pembayaran…</>
          ) : (
            <>Mulai Pro · IDR 49.000 <ArrowRight className="ml-2 h-5 w-5" /></>
          )}
        </Button>
        {error && (
          <p className="mt-3 rounded-md bg-red-500/20 px-3 py-2 text-sm text-white">{error}</p>
        )}
        <p className="mt-4 text-xs text-emerald-200">
          Garansi 7 hari uang kembali · Batalkan kapan saja
        </p>
      </div>
    </section>
  )
}
