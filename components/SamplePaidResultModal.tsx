"use client";

import { X, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface SamplePaidResultModalProps {
  open: boolean;
  onClose: () => void;
  className?: string;
}

export function SamplePaidResultModal({
  open,
  onClose,
  className,
}: SamplePaidResultModalProps) {
  if (!open) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center p-4",
        className
      )}
      role="dialog"
      aria-modal="true"
      aria-label="Contoh hasil premium"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <Card className="relative z-10 max-w-md w-full max-h-[90vh] overflow-y-auto animate-fade-in-up shadow-2xl">
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <h2 className="font-semibold text-lg">Contoh Hasil Premium</h2>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              aria-label="Tutup"
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-lg p-3 text-xs text-emerald-700 dark:text-emerald-300">
            💡 Ini adalah contoh tampilan hasil premium. Upgrade untuk membuka semua fitur.
          </div>

          <div className="space-y-3">
            {[
              { label: "PPh21 per Bulan", value: "Rp 847.500", blurred: false },
              { label: "Selisih PPh21", value: "Rp 52.000", blurred: false },
              { label: "Gaji Bruto Setahun", value: "Rp 124.800.000", blurred: false },
              { label: "P25 (Median Bawah)", value: "Rp 8.200.000", blurred: true },
              { label: "P75 (Median Atas)", value: "Rp 12.500.000", blurred: true },
              { label: "Tren Gaji 3 Tahun", value: "📈 +15%", blurred: true },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{item.label}</span>
                <span
                  className={cn(
                    "text-sm font-medium",
                    item.blurred && "blur-[3px] select-none"
                  )}
                >
                  {item.value}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-border pt-4 space-y-3">
            <Button
              asChild
              className="w-full bg-emerald-600 hover:bg-emerald-700"
            >
              <a href="/upgrade?plan=basic">Upgrade ke Basic — Rp 29K/bulan</a>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <a href="/slip">Cek Gratisan</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
