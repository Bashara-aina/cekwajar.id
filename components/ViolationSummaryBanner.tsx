'use client';

import { AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Violation {
  code: string;
  title: string;
  severity: string;
  amount?: number;
}

interface ViolationSummaryBannerProps {
  violations: Violation[];
  totalIDR?: number;
  className?: string;
}

export function ViolationSummaryBanner({
  violations,
  totalIDR,
  className,
}: ViolationSummaryBannerProps) {
  if (!violations || violations.length === 0) return null;

  const criticalCount = violations.filter(
    (v) => v.severity === 'CRITICAL' || v.severity === 'TINGGI'
  ).length;

  const hasV06 = violations.some((v) => v.code === 'V06');

  const isCritical = criticalCount > 0;

  const formatIDR = (num: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(num);

  return (
    <div
      className={cn(
        'rounded-xl p-5 mb-4 animate-fade-in-up border-2',
        hasV06
          ? 'bg-red-50 dark:bg-red-950/30 border-red-500 dark:border-red-500 animate-pulse-critical'
          : isCritical
          ? 'bg-red-50 dark:bg-red-950/30 border-red-300 dark:border-red-800'
          : 'bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800',
        className
      )}
    >
      <div className="flex items-center gap-3">
        <div
          className={cn(
            'w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0',
            isCritical ? 'bg-red-100 dark:bg-red-900' : 'bg-amber-100 dark:bg-amber-900'
          )}
        >
          <AlertTriangle
            className={cn(
              'w-6 h-6',
              isCritical ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'
            )}
          />
        </div>
        <div>
          <p
            className={cn(
              'text-2xl font-bold leading-none',
              isCritical ? 'text-red-700 dark:text-red-400' : 'text-amber-700 dark:text-amber-400'
            )}
          >
            {violations.length} Pelanggaran Ditemukan
          </p>
          <p
            className={cn(
              'text-sm mt-1',
              isCritical ? 'text-red-600 dark:text-red-300' : 'text-amber-600 dark:text-amber-300'
            )}
          >
            {totalIDR
              ? `Total estimasi ${formatIDR(totalIDR)}`
              : criticalCount > 0
              ? `${criticalCount} bersifat KRITIS — perlu segera ditindaklanjuti`
              : 'Cek detail di bawah untuk penjelasan dan saran'}
          </p>
        </div>
      </div>
    </div>
  );
}