'use client'
import { useEffect, useState } from 'react'
import { Loader2, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { REVENUE_ANCHORS } from '@/lib/constants'
import { useRouter } from 'next/navigation'

export function UpgradeFinalCta() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const router = useRouter()

  async function handlePay() {
    setError(null); setLoading(true)
    try {
      const res = await fetch('/api/payment/create-transaction', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: 'pro', billingPeriod: 'monthly', source: 'cta' }),
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
    <section className="bg-emerald-600 px-4 py-16 text-center">
      <div className="mx-auto max-w-md">
        <p className="text-sm font-medium text-white">30 detik dari sini sampai detail rupiah slip kamu.</p>
        <Button
          onClick={handlePay}
          disabled={loading}
          className="mt-4 h-14 w-full bg-white text-emerald-700 hover:bg-emerald-50"
        >
          {loading ? (
            <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Membuka pembayaran…</>
          ) : (
            <>Mulai Pro · IDR {REVENUE_ANCHORS.PRO_PRICE_IDR.toLocaleString('id-ID')}</>
          )}
        </Button>
        {error && (
          <p className="mt-3 text-sm text-red-200">{error}</p>
        )}
        <p className="mt-4 text-xs text-white">
          Garansi 7 hari uang kembali · Batalkan kapan saja
        </p>
      </div>
    </section>
  )
}