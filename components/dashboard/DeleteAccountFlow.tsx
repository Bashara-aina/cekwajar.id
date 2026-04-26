'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface Props {
  onDeleted?: () => void
}

export function DeleteAccountFlow({ onDeleted }: Props) {
  const [open, setOpen] = useState(false)
  const [confirmText, setConfirmText] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  async function deleteIt() {
    if (confirmText !== 'HAPUS') return
    setLoading(true)
    try {
      const res = await fetch('/api/account/delete', { method: 'POST' })
      if (res.ok) {
        setDone(true)
        setTimeout(() => {
          window.location.href = '/account-deleted'
          onDeleted?.()
        }, 1500)
      }
    } catch {
      setLoading(false)
    }
  }

  return (
    <>
      <Button
        variant="ghost"
        onClick={() => setOpen(true)}
        className="text-red-600 hover:bg-red-50 w-full justify-start"
      >
        Hapus akun saya
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-700">Hapus akun + seluruh data?</DialogTitle>
          </DialogHeader>
          {done ? (
            <div className="text-center py-4">
              <p className="text-sm font-medium text-slate-700">Akun akan dihapus dalam 7 hari.</p>
              <p className="mt-1 text-xs text-slate-500">Redirecting...</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-slate-700">
                Ini akan menghapus seluruh data kamu di sistem dalam 7 hari (UU PDP Pasal 23).
                Termasuk: slip yang masih tersisa, riwayat audit, langganan aktif (otomatis dibatalkan).
              </p>
              <p className="mt-2 text-xs text-slate-500">
                Ketik <strong>HAPUS</strong> untuk konfirmasi.
              </p>
              <input
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="Ketik HAPUS"
                className="rounded border border-slate-300 px-3 py-2 text-sm"
              />
              <Button
                disabled={confirmText !== 'HAPUS' || loading}
                onClick={deleteIt}
                className="bg-red-600 hover:bg-red-700"
                loading={loading}
              >
                Hapus akun saya
              </Button>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}