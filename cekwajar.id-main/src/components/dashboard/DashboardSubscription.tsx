// ══════════════════════════════════════════════════════════════════════════════
// cekwajar.id — Dashboard Subscription Card
// Shows current plan, renewal date, payment method, and management actions
// Includes cancel/refund flow with 30% off save offer
// ══════════════════════════════════════════════════════════════════════════════

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Shield,
  CreditCard,
  Calendar,
  AlertTriangle,
  XCircle,
  CheckCircle2,
  ChevronRight,
  Loader2,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { SubscriptionTier } from '@/types'

interface SubscriptionInfo {
  tier: SubscriptionTier
  renewsAt: string | null // ISO date or null if lifetime/canceled
  paymentMethod: string | null // e.g. "Visa •••• 4242" or null
  planId: string | null
  billingPeriod: 'monthly' | 'annual' | null
}

interface SubscriptionResponse {
  success: boolean
  data: SubscriptionInfo | null
}

interface CancelOfferResponse {
  success: boolean
  data: {
    discountedPrice: number
    billingPeriod: 'monthly' | 'annual'
    savingsPercent: number
  } | null
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

const TIER_LABELS: Record<SubscriptionTier, string> = {
  free: 'Paket Gratis',
  pro: 'Paket Pro',
}

export function DashboardSubscription() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [showSaveOffer, setShowSaveOffer] = useState(false)
  const [cancelLoading, setCancelLoading] = useState(false)

  const { data, isLoading } = useQuery<SubscriptionResponse>({
    queryKey: ['subscription-info'],
    queryFn: async () => {
      const res = await fetch('/api/subscription/info')
      return res.json()
    },
  })

  const saveOfferMutation = useMutation<CancelOfferResponse, Error>({
    mutationFn: async () => {
      const res = await fetch('/api/subscription/save-offer', { method: 'POST' })
      return res.json()
    },
  })

  const cancelSubscriptionMutation = useMutation<void, Error>({
    mutationFn: async () => {
      const res = await fetch('/api/subscription/cancel', { method: 'POST' })
      if (!res.ok) throw new Error('Failed to cancel')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription-info'] })
      setShowCancelDialog(false)
      setShowSaveOffer(false)
    },
  })

  const handleCancelClick = () => {
    setShowCancelDialog(true)
  }

  const handleCancelConfirm = async () => {
    setCancelLoading(true)
    // Check for save offer first
    const offerResult = await saveOfferMutation.mutateAsync()
    if (offerResult.success && offerResult.data) {
      setShowCancelDialog(false)
      setShowSaveOffer(true)
    } else {
      await cancelSubscriptionMutation.mutateAsync()
    }
    setCancelLoading(false)
  }

  const handleAcceptSaveOffer = async () => {
    setCancelLoading(true)
    try {
      const res = await fetch('/api/subscription/accept-save-offer', { method: 'POST' })
      if (res.ok) {
        queryClient.invalidateQueries({ queryKey: ['subscription-info'] })
        setShowSaveOffer(false)
      } else {
        await cancelSubscriptionMutation.mutateAsync()
      }
    } catch {
      await cancelSubscriptionMutation.mutateAsync()
    }
    setCancelLoading(false)
  }

  const handleDeclineSaveOffer = async () => {
    setCancelLoading(true)
    await cancelSubscriptionMutation.mutateAsync()
    setCancelLoading(false)
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-5">
          <div className="space-y-3">
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-4 w-32" />
          </div>
        </CardContent>
      </Card>
    )
  }

  const sub = data?.data

  // Free tier — no subscription info needed
  if (!sub || sub.tier === 'free') {
    return null
  }

  const isCanceled = sub.renewsAt === null
  const tierLabel = TIER_LABELS[sub.tier]

  return (
    <>
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/40">
                <Shield className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <CardTitle className="text-base">{tierLabel}</CardTitle>
            </div>
            <Badge variant="secondary" className="text-xs">
              {sub.billingPeriod === 'annual' ? 'Tahunan' : 'Bulanan'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {sub.renewsAt && !isCanceled ? (
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-500">
              <Calendar className="h-4 w-4" />
              <span>Berakhir {formatDate(sub.renewsAt)}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400">
              <AlertTriangle className="h-4 w-4" />
              <span>Langganan dibatalkan</span>
            </div>
          )}

          {sub.paymentMethod && (
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-500">
              <CreditCard className="h-4 w-4" />
              <span>{sub.paymentMethod}</span>
            </div>
          )}

          <div className="flex flex-col gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-between border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
              onClick={handleCancelClick}
            >
              <>
                <XCircle className="mr-2 h-4 w-4" />
                Batalkan Langganan
              </>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Cancel confirmation dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Batalkan Langganan?</DialogTitle>
            <DialogDescription>
              Kamu akan kehilangan akses ke fitur premium setelah masa langganan berakhir.
              Audit yang sudah dilakukan tidak akan dihapus.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
              Tetap Berlangganan
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelConfirm}
              disabled={cancelLoading}
            >
              {cancelLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Ya, Batalkan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Save offer dialog — 30% off */}
      <Dialog open={showSaveOffer} onOpenChange={setShowSaveOffer}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tunggu dulu! Dapat diskon 30%</DialogTitle>
            <DialogDescription>
              Sebagai ucapan terima kasih atas kesetiaanmu, kami tawarkan:
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-center">
              <p className="text-2xl font-bold text-emerald-700">30% OFF</p>
              <p className="text-sm text-emerald-600">3 siklus langganan berikutnya</p>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={handleDeclineSaveOffer} disabled={cancelLoading}>
              Tidak, Batalkan
            </Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={handleAcceptSaveOffer} disabled={cancelLoading}>
              {cancelLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
              Ya, Saya Mau
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}