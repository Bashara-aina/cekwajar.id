// ══════════════════════════════════════════════════════════════════════════════
// cekwajar.id — Dashboard Other Tools Grid
// De-emphasized secondary tools — less prominent than the main Wajar Slip
// ══════════════════════════════════════════════════════════════════════════════

'use client'

import Link from 'next/link'
import { TrendingUp, MapPin, Globe, BarChart3 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

const OTHER_TOOLS = [
  {
    id: 'wajar-gaji',
    name: 'Wajar Gaji',
    href: '/wajar-gaji',
    description: 'Benchmark gaji dengan 12.000+ data karyawan.',
    icon: TrendingUp,
    iconBgClass: 'bg-blue-100 dark:bg-blue-900/40',
    iconTextClass: 'text-blue-600 dark:text-blue-400',
    borderClass: 'hover:border-blue-300 dark:hover:border-blue-700',
  },
  {
    id: 'wajar-tanah',
    name: 'Wajar Tanah',
    href: '/wajar-tanah',
    description: 'Cek harga properti vs nilai pasar.',
    icon: MapPin,
    iconBgClass: 'bg-amber-100 dark:bg-amber-900/40',
    iconTextClass: 'text-amber-600 dark:text-amber-400',
    borderClass: 'hover:border-amber-300 dark:hover:border-amber-700',
  },
  {
    id: 'wajar-kabur',
    name: 'Wajar Kabur',
    href: '/wajar-kabur',
    description: 'Bandingkan PPP 20 negara.',
    icon: Globe,
    iconBgClass: 'bg-indigo-100 dark:bg-indigo-900/40',
    iconTextClass: 'text-indigo-600 dark:text-indigo-400',
    borderClass: 'hover:border-indigo-300 dark:hover:border-indigo-700',
  },
  {
    id: 'wajar-hidup',
    name: 'Wajar Hidup',
    href: '/wajar-hidup',
    description: 'Hitung gaji setara di kota lain.',
    icon: BarChart3,
    iconBgClass: 'bg-rose-100 dark:bg-rose-900/40',
    iconTextClass: 'text-rose-600 dark:text-rose-400',
    borderClass: 'hover:border-rose-300 dark:hover:border-rose-700',
  },
]

export function DashboardOtherTools() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {OTHER_TOOLS.map((tool) => (
        <Link key={tool.id} href={tool.href}>
          <Card
            className={cn(
              'h-full cursor-pointer border-slate-200 bg-slate-50 transition-all duration-200 hover:shadow-md dark:border-slate-700 dark:bg-slate-900/50',
              tool.borderClass
            )}
          >
            <CardContent className="flex flex-col gap-2 p-4">
              <div className={cn('flex h-9 w-9 items-center justify-center rounded-lg', tool.iconBgClass)}>
                <tool.icon className={cn('h-5 w-5', tool.iconTextClass)} />
              </div>
              <div>
                <p className="font-medium text-slate-700 dark:text-slate-300 text-sm">{tool.name}</p>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-500 line-clamp-2">
                  {tool.description}
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}