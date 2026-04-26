import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DeleteAccountFlow } from '@/components/dashboard/DeleteAccountFlow'
import { SecurityBadges } from '@/components/legal/SecurityBadges'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ChevronLeft, Download, ShieldCheck } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Pengaturan Akun — cekwajar.id',
  description: 'Kelola akun, privasi, dan langganan.',
}

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
  const sb = await createClient()
  const { data: { user } } = await sb.auth.getUser()

  if (!user) {
    redirect('/auth/login?next=/dashboard/settings')
  }

  const { data: profile } = await sb
    .from('user_profiles')
    .select('email, full_name, consent_version, created_at')
    .eq('id', user.id)
    .maybeSingle()

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard" className="text-slate-400 hover:text-slate-600">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-xl font-extrabold text-slate-900">Pengaturan</h1>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <h2 className="text-base font-bold text-slate-900">Akun</h2>
        <div className="mt-3 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">Nama</span>
            <span className="font-medium text-slate-800">{profile?.full_name ?? 'Belum diatur'}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">Email</span>
            <span className="font-medium text-slate-800">{user.email}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">Member sejak</span>
            <span className="text-slate-600">
              {profile?.created_at
                ? new Date(profile.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
                : '-'}
            </span>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <h2 className="text-base font-bold text-slate-900">Privasi (UU PDP)</h2>
        </div>
        <div className="mt-3 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">Persetujuan saat ini</span>
            <span className="font-mono text-xs text-slate-600">{profile?.consent_version ?? 'v1.0_2026_05'}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">Tarik persetujuan eksplisit</span>
            <Button variant="outline" size="sm" asChild>
              <Link href="/privacy-policy">Lihat kebijakan</Link>
            </Button>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">Download semua data saya</span>
            <Button variant="outline" size="sm" asChild>
              <a href="/api/account/export">
                <Download className="mr-1 h-3 w-3" /> Export JSON
              </a>
            </Button>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-red-200 bg-red-50/50 p-5 sm:p-6">
        <h2 className="text-base font-bold text-red-700">Zona Berbahaya</h2>
        <div className="mt-3 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-red-800">Hapus akun + semua data</p>
            <p className="mt-0.5 text-xs text-red-600">Kosongkan dalam 7 hari (Pasal 23 UU PDP)</p>
          </div>
          <DeleteAccountFlow />
        </div>
      </section>

      <SecurityBadges />
    </div>
  )
}