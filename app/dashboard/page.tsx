'use client'

import Link from 'next/link'
import { useState } from 'react'
import {
  FileText,
  Banknote,
  TrendingUp,
  Plane,
  Landmark,
  Crown,
  ChevronRight,
  Receipt,
  BarChart3,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface RecentAudit {
  id: string
  tool: string
  date: string
  verdict: 'SESUAI' | 'PERHATIAN' | 'KRITIS'
  city?: string
  amount?: number
}

const TOOL_META: Record<string, { label: string; icon: React.ElementType; href: string; color: string }> = {
  slip: { label: 'Wajar Slip', icon: Receipt, href: '/slip', color: 'text-amber-600 bg-amber-50' },
  gaji: { label: 'Wajar Gaji', icon: Banknote, href: '/gaji', color: 'text-blue-600 bg-blue-50' },
  tanah: { label: 'Wajar Tanah', icon: Landmark, href: '/tanah', color: 'text-stone-600 bg-stone-50' },
  kabur: { label: 'Wajar Kabur', icon: Plane, href: '/kabur', color: 'text-indigo-600 bg-indigo-50' },
  hidup: { label: 'Wajar Hidup', icon: BarChart3, href: '/hidup', color: 'text-teal-600 bg-teal-50' },
}

const MOCK_RECENT: RecentAudit[] = []

export default function DashboardPage() {
  const [recent] = useState<RecentAudit[]>(() => {
    try {
      const stored = typeof window !== 'undefined' ? localStorage.getItem('cw_recent_audits') : null
      return stored ? JSON.parse(stored) : MOCK_RECENT
    } catch {
      return MOCK_RECENT
    }
  })
  const [isPremium] = useState(false)

  const stats = [
    {
      label: 'Total Audit',
      value: recent.length,
      icon: FileText,
      color: 'text-emerald-600 bg-emerald-50',
    },
    {
      label: 'Pelanggaran Ditemukan',
      value: recent.filter(a => a.verdict !== 'SESUAI').length,
      icon: AlertTriangle,
      color: 'text-red-600 bg-red-50',
    },
    {
      label: 'Tool Digunakan',
      value: new Set(recent.map(a => a.tool)).size,
      icon: TrendingUp,
      color: 'text-blue-600 bg-blue-50',
    },
  ]

  return (
    <div className="max-w-3xl mx-auto space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Ringkasan aktivitas audit kamu</p>
        </div>
        {!isPremium && (
          <Button asChild size="sm" className="bg-amber-500 hover:bg-amber-600 text-white gap-1.5">
            <Link href="/upgrade">
              <Crown className="w-3.5 h-3.5" />
              Upgrade
            </Link>
          </Button>
        )}
      </div>

      {/* Premium Banner */}
      {!isPremium && (
        <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
          <CardContent className="pt-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center shrink-0">
                <Crown className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-semibold">Buka Fitur Premium</p>
                <p className="text-xs text-muted-foreground">Lihat selisih IDR per komponen pelanggaran</p>
              </div>
            </div>
            <Button asChild size="sm" className="bg-amber-500 hover:bg-amber-600 text-white shrink-0">
              <Link href="/upgrade">Rp 29K/bulan</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {stats.map(stat => {
          const Icon = stat.icon
          return (
            <Card key={stat.label}>
              <CardContent className="pt-4 text-center">
                <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center mx-auto mb-2', stat.color)}>
                  <Icon className="w-4 h-4" />
                </div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Audit Baru
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {Object.entries(TOOL_META).map(([key, meta]) => {
            const Icon = meta.icon
            return (
              <Link
                key={key}
                href={meta.href}
                className={cn(
                  'flex flex-col items-center gap-1.5 p-3 rounded-xl border text-center transition-all hover:shadow-sm',
                  meta.color,
                  'border-transparent hover:border-current/20'
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-medium">{meta.label}</span>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Recent Audits */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Audit Terbaru
        </h2>
        {recent.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center py-12">
              <Receipt className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-40" />
              <p className="text-sm font-medium">Belum ada audit yang dilakukan</p>
              <p className="text-xs text-muted-foreground mt-1 mb-4">
                Mulai dengan cek slip gaji kamu — hanya butuh 30 detik.
              </p>
              <Button asChild size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                <Link href="/slip">
                  Cek Slip Gaji Sekarang
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {recent.slice(0, 5).map(audit => {
              const meta = TOOL_META[audit.tool]
              if (!meta) return null
              const Icon = meta.icon
              return (
                <Card key={audit.id}>
                  <CardContent className="py-3 px-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center shrink-0', meta.color)}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{meta.label}</p>
                        <p className="text-xs text-muted-foreground">{audit.city || audit.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          audit.verdict === 'SESUAI'
                            ? 'default'
                            : audit.verdict === 'PERHATIAN'
                            ? 'secondary'
                            : 'destructive'
                        }
                        className="text-xs"
                      >
                        {audit.verdict}
                      </Badge>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

function AlertTriangle({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  )
}