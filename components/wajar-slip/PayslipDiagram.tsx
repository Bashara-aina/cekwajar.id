"use client";

import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LineItem {
  label: string;
  amount: number;
  violationCode?: string;
  type: "income" | "deduction";
}

interface PayslipDiagramProps {
  lines: LineItem[];
  violations: string[];
}

function formatIDR(v: number): string {
  return `Rp ${v.toLocaleString("id-ID")}`;
}

export function PayslipDiagram({ lines, violations }: PayslipDiagramProps) {
  const income = lines.filter((l) => l.type === "income");
  const deductions = lines.filter((l) => l.type === "deduction");

  return (
    <figure
      role="img"
      aria-label="Diagram audit slip gaji"
      className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl overflow-hidden"
    >
      <div className="bg-slate-100 dark:bg-slate-800 px-4 py-3 border-b border-slate-300 dark:border-slate-600">
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
          Slip Gaji (Diagram Audit)
        </p>
      </div>

      <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
        <p className="text-xs font-semibold text-muted-foreground mb-2">
          PENDAPATAN
        </p>
        {income.map((line) => (
          <div
            key={line.label}
            className="flex items-center justify-between py-1.5"
          >
            <span className="text-sm">{line.label}</span>
            <span className="font-mono text-sm">
              {formatIDR(line.amount)}
            </span>
          </div>
        ))}
      </div>

      <div className="px-4 py-3">
        <p className="text-xs font-semibold text-muted-foreground mb-2">
          POTONGAN
        </p>
        {deductions.map((line) => {
          const hasViolation =
            line.violationCode &&
            violations.includes(line.violationCode);
          return (
            <div
              key={line.label}
              className={cn(
                "flex items-center justify-between py-1.5 px-2 rounded-lg -mx-2 transition-colors",
                hasViolation && "bg-red-50 dark:bg-red-950/30"
              )}
            >
              <div className="flex items-center gap-2">
                {hasViolation ? (
                  <AlertTriangle
                    className="w-3.5 h-3.5 text-red-500 flex-shrink-0"
                    aria-hidden="true"
                  />
                ) : (
                  <CheckCircle2
                    className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0"
                    aria-hidden="true"
                  />
                )}
                <span
                  className={cn(
                    "text-sm",
                    hasViolation &&
                      "text-red-700 dark:text-red-400 font-medium"
                  )}
                >
                  {line.label}
                </span>
                {hasViolation && (
                  <span className="text-xs bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 px-1.5 py-0.5 rounded font-mono">
                    {line.violationCode}
                  </span>
                )}
              </div>
              <span
                className={cn(
                  "font-mono text-sm",
                  hasViolation &&
                    "text-red-700 dark:text-red-400"
                )}
              >
                {formatIDR(line.amount)}
              </span>
            </div>
          );
        })}
      </div>

      {violations.length > 0 && (
        <div className="bg-red-50 dark:bg-red-950/30 px-4 py-2 border-t border-red-200 dark:border-red-800">
          <p className="text-xs text-red-600 dark:text-red-400">
            ⚠️ Baris berwarna merah = komponen yang bermasalah
          </p>
        </div>
      )}

      <figcaption className="sr-only">
        Diagram audit slip gaji dengan {lines.length} komponen.{" "}
        {violations.length > 0
          ? `${violations.length} pelanggaran ditemukan: ${violations.join(", ")}`
          : "Tidak ada pelanggaran ditemukan."}
      </figcaption>
    </figure>
  );
}
