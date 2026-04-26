'use client'

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { CalendarDays, CreditCard, ShieldCheck, ArrowDown, RefreshCw } from 'lucide-react'

interface Profile {
  subscription_tier?: string
  subscription_renew_at?: string
  subscription_last_paid_at?: string
  payment_method?: string
  full_name?: string
}

interface User {
  email?: string
}

interface Props {
  user: User
  profile: Profile | null
}

export function DashboardSubscription({ user: _user, profile }: Props) {
  const [confirming, setConfirming] = useState<'cancel' | 'refund' | null>(null)
  const tier = profile?.subscription_tier ?? 'free'

  const paidAt = useMemo(() => {
    const raw = profile?.subscription_last_paid_at
    return raw ? new Date(raw) : null
  }, [profile?.subscription_last_paid_at])

  const refundDaysLeft = useMemo(() => {
    if (!paidAt) return 0
    const deadline = new Date(paidAt.getTime() + 7 * 24 * 3600 * 1000)
    const now = Date.now()
    return Math.max(0, Math.ceil((deadline.getTime() - now) / (24 * 3600 * 1000)))
  }, [paidAt])

  const renewAt = useMemo(() => {
    return profile?.subscription_renew_at ? new Date(profile.subscription_renew_at) : null
  }, [profile?.subscription_renew_at])

  if (tier === 'free') {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <h2 className="text-base font-bold text-slate-900">Langganan</h2>
        <p className="mt-1 text-sm text-slate-500">Kamu di paket Gratis.</p>
        <Button asChild className="mt-3 bg-emerald-600 hover:bg-emerald-700">
          <a href="/upgrade">Upgrade ke Pro · IDR 49.000</a>
        </Button>
      </section>
    )
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-slate-900">Langganan Pro</h2>
        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">Aktif</span>
      </div>
      <ul className="mt-3 space-y-1.5 text-sm text-slate-700">
        <li className="flex items-center gap-2">
          <CreditCard className="h-3.5 w-3.5 text-slate-400" />
          IDR 49.000/bulan via {profile?.payment_method ?? 'Midtrans'}
        </li>
        {renewAt && (
          <li className="flex items-center gap-2">
            <CalendarDays className="h-3.5 w-3.5 text-slate-400" />
            Otomatis perpanjang {renewAt.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
          </li>
        )}
        {refundDaysLeft > 0 && (
          <li className="flex items-center gap-2">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
            Refund 7-hari masih bisa ({refundDaysLeft} hari lagi)
          </li>
        )}
      </ul>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={() => setConfirming('cancel')}>
          <ArrowDown className="mr-1 h-3.5 w-3.5" /> Batalkan langganan
        </Button>
        {refundDaysLeft > 0 && (
          <Button
            variant="outline"
            size="sm"
            className="border-amber-300 text-amber-700 hover:bg-amber-50"
            onClick={() => setConfirming('refund')}
          >
            <RefreshCw className="mr-1 h-3.5 w-3.5" /> Refund ({refundDaysLeft} hari)
          </Button>
        )}
      </div>

      {confirming === 'cancel' && <CancelDialog onClose={() => setConfirming(null)} />}
      {confirming === 'refund' && <RefundDialog onClose={() => setConfirming(null)} />}
    </section>
  )
}

function CancelDialog({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState<'confirm' | 'offer' | 'done'>('confirm')
  const [loading, setLoading] = useState(false)

  const handleCancel = async () => {
    setLoading(true)
    await fetch('/api/subscription/cancel', { method: 'POST' }).catch(() => {})
    setStep('done')
    setLoading(false)
  }

  if (step === 'done') {
    return (
      <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4 text-center">
        <p className="text-sm font-medium text-slate-700">Langganan dibatalkan.</p>
        <p className="mt-1 text-xs text-slate-500">Akses Pro tetap berlaku sampai akhir periode.</p>
        <Button size="sm" variant="outline" onClick={onClose} className="mt-3">Tutup</Button>
      </div>
    )
  }

  return (
    <div className="mt-4 space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
      {step === 'confirm' && (
        <>
          <p className="text-sm font-medium text-slate-800">Batalkan langganan Pro?</p>
          <p className="text-xs text-slate-500">Kamu kehilangan akses ke detail rupiah selisih dan semua fitur Pro.</p>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={onClose}>Tetap aktif</Button>
            <Button size="sm" variant="destructive" onClick={() => setStep('offer')} loading={loading}>
              Batalkan
            </Button>
          </div>
        </>
      )}
      {step === 'offer' && (
        <>
          <p className="text-sm font-medium text-slate-800">Sebelum batal, mau diskon 30% untuk 3 bulan ke depan?</p>
          <p className="text-xs text-slate-500">Jadi cuma IDR 34.300/bulan sampai bulan ke-3.</p>
          <div className="flex gap-2">
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={handleCancel}>
              Iya, lanjut diskon
            </Button>
            <Button size="sm" variant="destructive" onClick={handleCancel}>
              Tetap batal
            </Button>
          </div>
        </>
      )}
    </div>
  )
}

function RefundDialog({ onClose }: { onClose: () => void }) {
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const handleRefund = async () => {
    setLoading(true)
    await fetch('/api/refund/request', { method: 'POST' }).catch(() => {})
    setDone(true)
    setLoading(false)
  }

  return (
    <div className="mt-4 space-y-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
      {done ? (
        <>
          <p className="text-sm font-medium text-amber-800">Refund diminta.</p>
          <p className="text-xs text-amber-600">Dana akan kembali ke metode pembayaran kamu dalam 1-5 hari kerja.</p>
          <Button size="sm" variant="outline" onClick={onClose} className="mt-2">Tutup</Button>
        </>
      ) : (
        <>
          <p className="text-sm font-medium text-amber-800">Minta refund 7 hari?</p>
          <p className="text-xs text-amber-600">Semua data audit akan tetap tersimpan. Dana kembali ke GoPay/OVO dalam 1-5 hari.</p>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={onClose}>Tidak jadi</Button>
            <Button size="sm" variant="destructive" onClick={handleRefund} loading={loading}>
              Ya, minta refund
            </Button>
          </div>
        </>
      )}
    </div>
  )
}