"use client";

import { Badge } from "./ui/badge";
import type { LucideIcon } from "lucide-react";

interface Violation {
  code: string;
  message: string;
  severity: "INFO" | "WARNING" | "CRITICAL" | "HIGH" | "MEDIUM";
}

interface ResultCardProps {
  title: string;
  amount?: number;
  amountLabel?: string;
  verdict?: string;
  verdictColor?: "green" | "yellow" | "red" | "gray";
  violations?: Violation[];
  icon?: LucideIcon;
  children?: React.ReactNode;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function ResultCard({
  title,
  amount,
  amountLabel,
  verdict,
  verdictColor = "gray",
  violations = [],
  icon: Icon,
  children,
}: ResultCardProps) {
  const verdictStyles = {
    green: "bg-green-100 text-green-800 border-green-300",
    yellow: "bg-yellow-100 text-yellow-800 border-yellow-300",
    red: "bg-red-100 text-red-800 border-red-300",
    gray: "bg-gray-100 text-gray-700 border-gray-300",
  };

  const severityStyles = {
    INFO: "border-l-4 border-l-blue-500",
    WARNING: "border-l-4 border-l-yellow-500",
    MEDIUM: "border-l-4 border-l-orange-500",
    HIGH: "border-l-4 border-l-orange-600",
    CRITICAL: "border-l-4 border-l-red-500",
  };

  return (
    <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b flex items-center gap-3">
        {Icon && <Icon className="h-5 w-5 text-gray-500" />}
        <h3 className="font-semibold text-gray-900">{title}</h3>
        {verdict && (
          <Badge className={`ml-auto ${verdictStyles[verdictColor]}`}>
            {verdict}
          </Badge>
        )}
      </div>

      {/* Amount */}
      {amount !== undefined && (
        <div className="px-5 py-4">
          <p className="text-sm text-gray-500 mb-1">{amountLabel ?? "Amount"}</p>
          <p className="text-3xl font-bold text-gray-900">{formatCurrency(amount)}</p>
        </div>
      )}

      {/* Violations */}
      {violations.length > 0 && (
        <div className="px-5 py-3 space-y-2">
          {violations.map((v, i) => (
            <div
              key={i}
              className={`rounded-lg px-3 py-2 text-sm bg-white border ${severityStyles[v.severity]}`}
            >
              <span className="font-mono text-xs text-gray-400 mr-2">[{v.code}]</span>
              {v.message}
            </div>
          ))}
        </div>
      )}

      {/* Custom content */}
      {children && <div className="px-5 py-4">{children}</div>}
    </div>
  );
}
