import { Metadata } from 'next'
import { Mail, MessageCircle, MapPin } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

export const metadata: Metadata = {
  title: 'Kontak Kami — cekwajar.id',
  description:
    'Hubungi tim cekwajar.id untuk pertanyaan, saran, atau bantuan terkait audit slip gaji.',
}

export default function KontakPage() {
  return (
    <div className="min-h-screen bg-slate-50 px-4 py-12">
      <div className="mx-auto max-w-2xl">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-900">Hubungi Kami</h1>
          <p className="mt-3 text-slate-600">
            Punya pertanyaan atau butuh bantuan? Kami siap membantu.
          </p>
        </div>

        <div className="mt-10 space-y-4">
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-100">
                <Mail className="h-5 w-5 text-emerald-700" />
              </div>
              <div>
                <h2 className="font-semibold text-slate-900">Email</h2>
                <p className="mt-1 text-sm text-slate-600">
                  hrdf@cekwajar.id
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Kami balas dalam 1-2 hari kerja
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-100">
                <MessageCircle className="h-5 w-5 text-emerald-700" />
              </div>
              <div>
                <h2 className="font-semibold text-slate-900">WhatsApp</h2>
                <p className="mt-1 text-sm text-slate-600">
                  +62 812-XXXX-XXXX (opsional)
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Untuk pertanyaan cepat seputar slip gaji
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-100">
                <MapPin className="h-5 w-5 text-emerald-700" />
              </div>
              <div>
                <h2 className="font-semibold text-slate-900">Alamat</h2>
                <p className="mt-1 text-sm text-slate-600">
                  Jakarta, Indonesia
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Data slip gaji disimpan di Singapore (Supabase ap-southeast-1)
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-10 rounded-lg border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-900">Kirim Pesan</h2>
          <form className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nama</label>
              <input
                type="text"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                placeholder="Nama kamu"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input
                type="email"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                placeholder="email@contoh.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Pesan</label>
              <textarea
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                rows={4}
                placeholder="Ceritakan pertanyaan atau masalah kamu..."
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-lg bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              Kirim Pesan
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
