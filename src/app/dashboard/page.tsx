'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Clock, CreditCard, History, Users, ArrowRight, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'

interface AuditHistory {
  id: string
  created_at: string
  verdict: string
  city: string
  gross_salary: number
  violations: any[]
}

interface Subscription {
  plan_type: string
  status: string
  ends_at: string
}

export default function DashboardPage() {
  const [audits, setAudits] = useState<AuditHistory[]>([])
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      const supabase = createClient()
      
      const [auditRes, subRes] = await Promise.all([
        supabase.from('payslip_audits').select('*').order('created_at', { ascending: false }).limit(10),
        supabase.from('subscriptions').select('*').single(),
      ])
      
      setAudits((auditRes.data as AuditHistory[]) || [])
      setSubscription(subRes.data as Subscription)
      setLoading(false)
    }
    
    loadData()
  }, [])

  const formatDate = (date: string) => new Date(date).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric'
  })

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">Dashboard</h1>

        {/* Subscription Status */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CreditCard className="h-8 w-8 text-emerald-600" />
                <div>
                  <p className="font-semibold text-slate-900">Plan {subscription?.plan_type?.toUpperCase() || 'FREE'}</p>
                  <p className="text-sm text-slate-500">
                    {subscription?.status === 'active'
                      ? `Berlaku sampai ${formatDate(subscription.ends_at)}`
                      : 'Tidak aktif'}
                  </p>
                </div>
              </div>
              {subscription?.plan_type !== 'pro' && (
                <Link href="/upgrade">
                  <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                    Upgrade ke Pro
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Link href="/wajar-slip">
            <Card className="hover:border-emerald-200 cursor-pointer">
              <CardContent className="p-6 flex items-center gap-3">
                <Clock className="h-6 w-6 text-emerald-600" />
                <div>
                  <p className="font-semibold">Cek Slip Baru</p>
                  <p className="text-sm text-slate-500">Audit slip gaji</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/wajar-gaji">
            <Card className="hover:border-emerald-200 cursor-pointer">
              <CardContent className="p-6 flex items-center gap-3">
                <Users className="h-6 w-6 text-emerald-600" />
                <div>
                  <p className="font-semibold">Cek Gaji</p>
                  <p className="text-sm text-slate-500">Benchmark gaji</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Recent Audits */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Riwayat Audit
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-slate-500">Memuat...</p>
            ) : audits.length === 0 ? (
              <div className="text-center py-8">
                <AlertTriangle className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">Belum ada audit</p>
                <Link href="/wajar-slip" className="mt-3 inline-block">
                  <Button variant="outline" size="sm">
                    Mulai Audit Pertama
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {audits.map((audit) => (
                  <div key={audit.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant={audit.verdict === 'SESUAI' ? 'default' : 'destructive'}>
                          {audit.verdict}
                        </Badge>
                        <span className="text-sm text-slate-500">{audit.city}</span>
                      </div>
                      <p className="text-sm text-slate-600 mt-1">
                        IDR {(audit.gross_salary / 1000000).toFixed(1)}M — {formatDate(audit.created_at)}
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-400" />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}