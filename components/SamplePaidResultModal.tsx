"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { SAMPLE_RESULT, UPGRADE_COPY } from "@/lib/upgrade-copy";

interface SamplePaidResultModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function SamplePaidResultModal({
  open,
  onOpenChange,
}: SamplePaidResultModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Contoh Hasil Paket Basic</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <p className="text-xs text-muted-foreground italic">
            Contoh dengan data fiktif — bukan data nyata
          </p>

          <div className="border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                {SAMPLE_RESULT.violationCode}
              </span>
              <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded font-semibold">
                TINGGI
              </span>
            </div>
            <p className="font-semibold text-sm mb-2">
              {SAMPLE_RESULT.violationMessage}
            </p>

            <div className="bg-muted/50 rounded-lg p-3 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-muted-foreground">PPh21 di slip:</span>
                <span className="font-mono">
                  Rp {SAMPLE_RESULT.pph21AtSlip.toLocaleString("id-ID")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Seharusnya (TER):</span>
                <span className="font-mono">
                  Rp {SAMPLE_RESULT.pph21ShouldBe.toLocaleString("id-ID")}
                </span>
              </div>
              <div className="flex justify-between border-t pt-1.5 mt-1.5">
                <span className="font-semibold">Selisih bulan ini:</span>
                <span className="font-mono font-bold text-red-600">
                  Rp {SAMPLE_RESULT.monthlyDiff.toLocaleString("id-ID")}
                </span>
              </div>
              <div className="flex justify-between text-amber-600 dark:text-amber-400">
                <span className="font-semibold">Potensi akumulasi setahun:</span>
                <span className="font-mono font-bold">
                  Rp {SAMPLE_RESULT.annualAccumulation.toLocaleString("id-ID")}
                </span>
              </div>
            </div>

            <p className="text-xs text-muted-foreground mt-2">
              {SAMPLE_RESULT.recommendation}
            </p>
          </div>

          <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-lg p-3 text-xs text-emerald-700 dark:text-emerald-400">
            💡 {UPGRADE_COPY.roiFrame}
          </div>

          <Button asChild className="w-full bg-emerald-600 hover:bg-emerald-700">
            <a href="/upgrade">
              Unlock Paket Basic — {UPGRADE_COPY.priceLabel} →
            </a>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
