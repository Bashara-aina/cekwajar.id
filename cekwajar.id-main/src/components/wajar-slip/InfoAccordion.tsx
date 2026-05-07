/**
 * cekwajar.id — Info Accordion
 * Single collapsible section for privacy info in the IDLE frame.
 * Replaces the top DisclaimerBanner per spec.
 */
'use client'

import { useState } from 'react'
import { ChevronDown, Info } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  className?: string
}

const PRIVACY_ITEMS = [
  {
    title: 'Kenapa slip gaji diperlukan?',
    body: 'Slip gaji adalah bukti ketidakpatuhan yang memungkinkan kami menghitung selisih PPh21 dan BPJS Anda. Data tidak disimpan di server kami — semua pemrosesan terjadi secara lokal di browser.',
  },
  {
    title: 'Apakah slip saya aman?',
    body: 'Ya. Slip yang Anda upload diproses oleh Google Vision API dan tidak pernah disimpan di database kami. Setelah OCR selesai, file asli langsung dihapus dari memory.',
  },
  {
    title: 'Siapa yang bisa melihat hasil audit saya?',
    body: 'Hanya Anda. Hasil audit hanya disimpan di browser Anda (localStorage) dan di database kami jika Anda login. Tidak ada pihak ketiga yang dapat mengakses data Anda.',
  },
]

export function InfoAccordion({ className }: Props) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <div className={cn('rounded-xl border border-slate-200 bg-white', className)}>
      <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100">
        <Info className="h-4 w-4 text-slate-500" />
        <span className="text-xs font-medium text-slate-600">Informasi privasi</span>
      </div>
      {PRIVACY_ITEMS.map((item, i) => (
        <div key={i} className="border-b border-slate-100 last:border-0">
          <button
            type="button"
            onClick={() => setOpenIndex(openIndex === i ? null : i)}
            className="flex w-full items-center justify-between px-4 py-3 text-left text-sm text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <span>{item.title}</span>
            <ChevronDown
              className={cn(
                'h-4 w-4 text-slate-500 transition-transform duration-200',
                openIndex === i && 'rotate-180'
              )}
            />
          </button>
          {openIndex === i && (
            <div className="px-4 pb-4 text-xs text-slate-500 leading-7">
              {item.body}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}