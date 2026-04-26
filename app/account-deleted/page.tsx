import type { Metadata } from 'next'
import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Akun Dihapus — cekwajar.id',
}

export default function AccountDeletedPage() {
  return (
    <div className="max-w-lg mx-auto px-4 py-16 text-center space-y-6">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 mx-auto">
        <CheckCircle2 className="h-8 w-8 text-emerald-600" />
      </div>
      <h1 className="text-2xl font-extrabold text-slate-900">Akun sudah dihapus</h1>
      <p className="text-sm text-slate-600">
        Seluruh data kamu sudah dihapus dari sistem dalam 7 hari sesuai UU PDP Pasal 23.
        Kalau kamu berubah pikiran, kamu bisa daftar ulang kapan saja.
      </p>
      <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-600 hover:underline">
        Kembali ke homepage →
      </Link>
    </div>
  )
}