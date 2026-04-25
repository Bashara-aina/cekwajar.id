"use client";

import { Lock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { UPGRADE_COPY } from "@/lib/upgrade-copy";

interface PremiumGateProps {
  hiddenLabel?: string;
  benefit?: string;
  compact?: boolean;
  className?: string;
  previewContent?: React.ReactNode;
}

export function PremiumGate({
  hiddenLabel = "Data lengkap",
  benefit = "Lihat selisih IDR, detail perhitungan, dan rekomendasi tindak lanjut",
  compact = false,
  className,
  previewContent,
}: PremiumGateProps) {
  if (compact) {
    return (
      <div
        className={cn(
          "flex items-center gap-2 text-xs text-muted-foreground py-2",
          className
        )}
      >
        <Lock className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
        <span className="blur-sm select-none pointer-events-none">
          Rp ██.███.███
        </span>
        <Link
          href="/upgrade"
          className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline flex-shrink-0"
        >
          Upgrade →
        </Link>
      </div>
    );
  }

  return (
    <div className={cn("relative rounded-xl overflow-hidden", className)}>
      {previewContent && (
        <div
          className="blur-sm select-none pointer-events-none opacity-60"
          aria-hidden="true"
        >
          {previewContent}
        </div>
      )}

      <div
        className={cn(
          "rounded-xl border-2 border-emerald-200 dark:border-emerald-800",
          "bg-gradient-to-b from-white/95 to-emerald-50/95 dark:from-slate-900/95 dark:to-emerald-950/95",
          "p-6 text-center",
          previewContent ? "absolute inset-0 flex flex-col items-center justify-center" : ""
        )}
      >
        <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center mx-auto mb-3">
          <Lock className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
        </div>

        <h3 className="font-bold text-foreground text-base mb-1">
          {hiddenLabel}
        </h3>
        <p className="text-sm text-muted-foreground mb-4 max-w-xs mx-auto">
          {benefit}
        </p>

        <Button
          asChild
          className="bg-emerald-600 hover:bg-emerald-700 text-white w-full max-w-xs gap-2"
        >
          <Link href="/upgrade">
            <Sparkles className="w-4 h-4" />
            Upgrade Paket Basic — Rp 29K/bulan
          </Link>
        </Button>

        <p className="text-xs text-muted-foreground mt-2">
          {UPGRADE_COPY.valueFrame}. {UPGRADE_COPY.cancelAnytime}.
        </p>
      </div>
    </div>
  );
}
