'use client'

import * as React from 'react'
import { Skeleton } from '@/components/ui/skeleton'

interface ToolSkeletonProps {
  variant?: 'slip' | 'gaji' | 'tanah' | 'kabur' | 'hidup'
}

export function ToolSkeleton({ variant = 'slip' }: ToolSkeletonProps) {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-2xl px-4 py-10 space-y-5">
        {/* Header */}
        <div className="text-center space-y-2">
          <Skeleton className="h-8 w-64 mx-auto" />
          <Skeleton className="h-4 w-80 mx-auto" />
        </div>

        {/* Drop zone or main content */}
        {variant === 'slip' && (
          <Skeleton className="h-40 w-full rounded-xl border-2 border-dashed" />
        )}

        {/* Loading steps */}
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-3 w-3 rounded-full" />
              <Skeleton className="h-4 flex-1" />
              {i === 1 && <Skeleton className="h-3 w-12" />}
            </div>
          ))}
        </div>

        {/* Verdict skeleton */}
        <div className="space-y-4">
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>

        {/* Footer */}
        <div className="flex gap-3">
          <Skeleton className="h-10 flex-1 rounded-lg" />
          <Skeleton className="h-10 flex-1 rounded-lg" />
        </div>
      </div>
    </div>
  )
}