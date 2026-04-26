import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Users, Gift, Copy, CheckCircle2 } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Ajukan Teman — cekwajar.id',
  description: 'Bagikan ke teman, dapat 1 bulan gratis.',
}

function generateRefCode(userId: string): string {
  return userId.slice(0, 8).toUpperCase()
}

export const dynamic = 'force-dynamic'

export default async function ReferralPage() {
  const sb = await createClient()
  const { data: { user } } = await sb.auth.getUser()

  if (!user) {
    redirect('/auth/login?next=/dashboard?tab=referral')
  }

  const { data: profile } = await sb
    .from('user_profiles')
    .select('referral_code, referral_count, referral_converted_count')
    .eq('id', user.id)
    .maybeSingle()

  const refCode = profile?.referral_code ?? generateRefCode(user.id)
  const shareUrl = `https://cekwajar.id/r/${refCode}`

  const { data: referrals } = await sb
    .from('referrals')
    .select('id, referred_email, converted_at, created_at')
    .eq('referrer_id', user.id)
    .order('created_at', { ascending: false })
    .limit(10)

  const totalReferred = referrals?.length ?? 0
  const totalConverted = referrals?.filter(r => r.converted_at).length ?? 0

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 space-y-6">
      <div className="text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 mb-3">
          <Gift className="h-7 w-7 text-emerald-700" />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900">Bagikan ke teman</h1>
        <p className="mt-2 text-slate-600">
          Kamu dapat <span className="font-bold text-emerald-700">1 bulan gratis</span> untuk setiap teman yangupgrade ke Pro.
        </p>
      </div>

      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-5 sm:p-6">
        <p className="text-sm font-semibold text-emerald-800 mb-2">Link referral kamu:</p>
        <div className="flex items-center gap-2 bg-white rounded-lg border p-3">
          <code className="flex-1 text-sm font-mono text-slate-700 truncate">{shareUrl}</code>
          <button
            onClick={() => navigator.clipboard.writeText(shareUrl)}
            className="shrink-0 flex items-center gap-1 text-xs text-emerald-700 hover:text-emerald-800"
          >
            <Copy className="h-3.5 w-3.5" /> Salin
          </button>
        </div>
        <p className="mt-2 text-xs text-emerald-700">Maks. 12 bulan gratis per pengguna untuk mencegah abuse.</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <h2 className="text-base font-bold text-slate-900">Status</h2>
        <div className="mt-3 grid grid-cols-2 gap-4">
          <div className="rounded-xl bg-slate-50 p-4 text-center">
            <Users className="mx-auto h-6 w-6 text-slate-400 mb-1" />
            <p className="text-2xl font-extrabold text-slate-900">{totalReferred}</p>
            <p className="text-xs text-slate-500">Teman klik link</p>
          </div>
          <div className="rounded-xl bg-emerald-50 p-4 text-center">
            <CheckCircle2 className="mx-auto h-6 w-6 text-emerald-500 mb-1" />
            <p className="text-2xl font-extrabold text-emerald-700">{totalConverted}</p>
            <p className="text-xs text-slate-500">Teman jadi Pro</p>
          </div>
        </div>
        {totalConverted > 0 && (
          <p className="mt-3 text-sm text-emerald-700">
            Kamu sudah dapat +{totalConverted * 30} hari langganan gratis.
          </p>
        )}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <h2 className="text-base font-bold text-slate-900 mb-3">Cara kerja</h2>
        <ol className="space-y-3">
          <li className="flex items-start gap-3 text-sm">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">1</span>
            <span className="text-slate-600">Bagikan link di atas via WhatsApp, Instagram, atau Twitter.</span>
          </li>
          <li className="flex items-start gap-3 text-sm">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">2</span>
            <span className="text-slate-600">Teman klik link danupgrade ke Pro IDR 49.000.</span>
          </li>
          <li className="flex items-start gap-3 text-sm">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">3</span>
            <span className="text-slate-600">Kamu otomatis dapat +30 hari langganan gratis.</span>
          </li>
        </ol>
      </div>

      <Link href="/dashboard" className="flex items-center justify-center gap-1 text-sm text-slate-500 hover:text-slate-700">
        ← Kembali ke dashboard
      </Link>
    </div>
  )
}