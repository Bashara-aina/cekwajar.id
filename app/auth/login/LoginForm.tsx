'use client'

import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface LoginFormProps {
  intent?: string
}

export function LoginForm({ intent }: LoginFormProps) {
  const title = intent === 'signup' ? 'Buat akun' : 'Masuk'
  const subtitle = intent === 'signup'
    ? 'Kami akan kirim magic link ke email kamu.'
    : 'Masuk ke akun kamu.'

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-extrabold text-slate-900">{title}</h1>
          <p className="mt-2 text-sm text-slate-600">{subtitle}</p>
        </div>

        <div className="space-y-3">
          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs font-medium text-slate-700">Email</label>
              <input
                id="email"
                type="email"
                placeholder="nama@email.com"
                className="w-full rounded-md border border-slate-200 bg-white px-3 py-2.5 text-sm"
                autoComplete="email"
              />
            </div>
            <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 h-11">
              Kirim Magic Link
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-slate-400">atau</span>
            </div>
          </div>

          <Button variant="outline" className="w-full h-11" onClick={() => {}}>
            Lanjutkan dengan Google
          </Button>
        </div>

        <div className="border-t pt-5 text-center">
          <p className="text-xs text-slate-500">Belum punya akun?</p>
          <Link
            href="/slip"
            className="mt-1 inline-block text-sm font-semibold text-emerald-700 hover:underline"
          >
            Audit slip gaji dulu — gratis, tanpa daftar →
          </Link>
        </div>
      </div>
    </div>
  )
}