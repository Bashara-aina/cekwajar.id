"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type Verdict = "MURAH" | "WAJAR" | "MAHAL" | "SANGAT_MAHAL";

interface PropertyPriceBarProps {
  p25: number;
  p50: number;
  p75: number;
  upperFence: number;
  userPrice: number;
  verdict: Verdict;
  pricePerM2?: number;
}

function formatIDR(v: number): string {
  if (v >= 1_000_000_000)
    return `Rp ${(v / 1_000_000_000).toFixed(1)}M`;
  if (v >= 1_000_000) return `Rp ${(v / 1_000_000).toFixed(0)}jt`;
  return `Rp ${v.toLocaleString("id-ID")}`;
}

const VERDICT_CONFIG: Record<
  Verdict,
  { label: string; color: string; bg: string; textColor: string }
> = {
  MURAH: {
    label: "🟢 MURAH",
    color: "bg-emerald-500",
    bg: "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800",
    textColor: "text-emerald-700 dark:text-emerald-400",
  },
  WAJAR: {
    label: "🔵 WAJAR",
    color: "bg-blue-500",
    bg: "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800",
    textColor: "text-blue-700 dark:text-blue-400",
  },
  MAHAL: {
    label: "🟡 MAHAL",
    color: "bg-amber-500",
    bg: "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800",
    textColor: "text-amber-700 dark:text-amber-400",
  },
  SANGAT_MAHAL: {
    label: "🔴 SANGAT MAHAL",
    color: "bg-red-500",
    bg: "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800",
    textColor: "text-red-700 dark:text-red-400",
  },
};

export function PropertyPriceBar({
  p25,
  p50,
  p75,
  upperFence,
  userPrice,
  verdict,
  pricePerM2,
}: PropertyPriceBarProps) {
  const [animated, setAnimated] = useState(false);
  const config = VERDICT_CONFIG[verdict];

  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const t = setTimeout(
      () => setAnimated(true),
      prefersReduced ? 0 : 200
    );
    return () => clearTimeout(t);
  }, []);

  const min = p25 * 0.6;
  const max = Math.max(upperFence * 1.2, userPrice * 1.1);
  const range = max - min;

  const toPos = (v: number) =>
    Math.min(100, Math.max(0, ((v - min) / range) * 100));

  const zones = [
    {
      from: toPos(min),
      to: toPos(p25),
      color: "bg-emerald-200 dark:bg-emerald-900/40",
      label: "Murah",
    },
    {
      from: toPos(p25),
      to: toPos(p75),
      color: "bg-blue-200 dark:bg-blue-900/40",
      label: "Wajar",
    },
    {
      from: toPos(p75),
      to: toPos(upperFence),
      color: "bg-amber-200 dark:bg-amber-900/40",
      label: "Mahal",
    },
    {
      from: toPos(upperFence),
      to: 100,
      color: "bg-red-200 dark:bg-red-900/40",
      label: "Sangat Mahal",
    },
  ];

  return (
    <figure
      role="img"
      aria-label={`Zona harga properti di ${verdict}`}
      className="space-y-4"
    >
      <div
        className={cn(
          "rounded-xl border-2 p-5 text-center animate-in zoom-in duration-300",
          config.bg
        )}
      >
        <p
          className={cn("text-3xl font-black mb-1", config.textColor)}
        >
          {config.label}
        </p>
        <p className="text-2xl font-bold text-foreground">
          {formatIDR(userPrice)}
        </p>
        {pricePerM2 && (
          <p className="text-sm text-muted-foreground mt-1">
            {formatIDR(pricePerM2)}/m²
          </p>
        )}
      </div>

      <div className="relative h-8 rounded-full overflow-hidden">
        {zones.map((zone, i) => (
          <div
            key={i}
            className={cn("absolute inset-y-0", zone.color)}
            style={{
              left: `${zone.from}%`,
              width: `${zone.to - zone.from}%`,
            }}
          />
        ))}

        <div
          className={cn(
            "absolute inset-y-0 w-1 -translate-x-0.5 transition-all duration-1000 ease-out",
            config.color,
            animated ? "" : "opacity-0"
          )}
          style={{ left: animated ? `${toPos(userPrice)}%` : "0%" }}
        />
      </div>

      <div className="relative h-6">
        {[
          { value: p25, label: "P25" },
          { value: p50, label: "Median" },
          { value: p75, label: "P75" },
        ].map((m) => (
          <div
            key={m.label}
            className="absolute -translate-x-1/2 text-center"
            style={{ left: `${toPos(m.value)}%` }}
          >
            <p className="text-xs text-muted-foreground whitespace-nowrap">
              {m.label}
            </p>
            <p className="text-xs font-mono text-muted-foreground">
              {formatIDR(m.value)}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 text-center text-xs">
        <div className="bg-muted/50 rounded-lg p-3">
          <p className="text-muted-foreground">Median area ini</p>
          <p className="font-bold text-sm mt-0.5">{formatIDR(p50)}</p>
        </div>
        <div className="bg-muted/50 rounded-lg p-3">
          <p className="text-muted-foreground">Harga kamu</p>
          <p className={cn("font-bold text-sm mt-0.5", config.textColor)}>
            {formatIDR(userPrice)}
          </p>
        </div>
      </div>

      <figcaption className="sr-only">
        Harga properti {formatIDR(userPrice)} berada di zona{" "}
        {config.label}. Median: {formatIDR(p50)}, P25: {formatIDR(p25)},
        P75: {formatIDR(p75)}.
      </figcaption>
    </figure>
  );
}
