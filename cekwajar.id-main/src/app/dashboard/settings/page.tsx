'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Trash2, AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

export default function DashboardSettingsPage() {
  const router = useRouter()
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteSuccess, setDeleteSuccess] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  async function handleDeleteAccount() {
    setDeleting(true)
    setDeleteError(null)
    try {
      const res = await fetch('/api/user/delete-account', { method: 'DELETE' })
      const json = await res.json()
      if (!res.ok || json.error) {
        setDeleteError(typeof json.error === 'string' ? json.error : 'Gagal menghapus akun.')
        setDeleting(false)
        return
      }
      setDeleteSuccess(true)
      setTimeout(() => { router.push('/') }, 2000)
    } catch {
      setDeleteError('Tidak dapat terhubung ke server.')
      setDeleting(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto max-w-2xl px-4 py-8 space-y-6">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="sm" className="shrink-0">
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-50">
              Pengaturan Akun
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-500">
              Kelola preferensi dan data akun kamu.
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Akun</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Hapus Akun</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Permanen delete semua data kamu dalam 7 hari (UU PDP Pasal 22).
                </p>
              </div>
            </div>

            <Separator />

            {!deleteSuccess ? (
              <>
                {!confirmDelete ? (
                  <Button
                    variant="outline"
                    className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                    onClick={() => setConfirmDelete(true)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Hapus Akun Saya
                  </Button>
                ) : (
                  <div className="space-y-4">
                    <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
                        <div>
                          <p className="text-sm font-semibold text-red-800">
                            Yakin ingin menghapus akun?
                          </p>
                          <p className="mt-1 text-xs text-red-700">
                            Semua data akan dihapus secara permanen dalam 7 hari:
                          </p>
                          <ul className="mt-1 space-y-0.5 text-xs text-red-700 list-disc list-inside">
                            <li>Profil dan langganan</li>
                            <li>Riwayat audit slip gaji</li>
                            <li>Transaksi dan metode pembayaran</li>
                            <li>File slip gaji yang diupload</li>
                          </ul>
                          <p className="mt-2 text-xs font-medium text-red-800">
                            Tindakan ini tidak bisa dibatalkan.
                          </p>
                        </div>
                      </div>
                    </div>

                    {deleteError && (
                      <p className="text-sm text-red-600">{deleteError}</p>
                    )}

                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => { setConfirmDelete(false); setDeleteError(null) }}
                        disabled={deleting}
                      >
                        Batal
                      </Button>
                      <Button
                        variant="destructive"
                        className="flex-1 bg-red-600 hover:bg-red-700"
                        onClick={handleDeleteAccount}
                        disabled={deleting}
                      >
                        {deleting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Menghapus...
                          </>
                        ) : (
                          <>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Ya, Hapus Akun
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center gap-3 py-4 text-center">
                <div className="rounded-full bg-emerald-100 p-3">
                  <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                </div>
                <div>
                  <p className="font-semibold text-emerald-800">Permintaan diterima.</p>
                  <p className="mt-1 text-sm text-emerald-700">
                    Data kamu akan dihapus dalam 7 hari. Redirecting...
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex flex-wrap gap-4 text-xs text-slate-500">
          <Link href="/privacy-policy" className="hover:text-emerald-600">Kebijakan Privasi</Link>
          <Link href="/terms" className="hover:text-emerald-600">Syarat & Ketentuan</Link>
          <Link href="/security/policy" className="hover:text-emerald-600">Keamanan</Link>
        </div>
      </div>
    </div>
  )
}