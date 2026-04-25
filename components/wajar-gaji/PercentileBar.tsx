"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface PercentileBarProps {
  p25: number;
  p50: number;
  p75: number;
  userSalary: number;
  label?: string;
}

function formatIDR(value: number): string {
  if (value >= 1_000_000) return `Rp ${(value / 1_000_000).toFixed(1)}jt`;
  if (value >= 1_000) return `Rp ${(value / 1_000).toFixed(0)}rb`;
  return `Rp ${value.toLocaleString("id-ID")}`;
}

function calcUserPosition(salary: number, p25: number, p75: number): number {
  const rangeMin = p25 * 0.7;
  const rangeMax = p75 * 1.3;
  const clamped = Math.min(Math.max(salary, rangeMin), rangeMax);
  return ((clamped - rangeMin) / (rangeMax - rangeMin)) * 100;
}

function calcPercentile(
  salary: number,
  p25: number,
  p50: number,
  p75: number
): number {
  if (salary <= p25)
    return Math.round(25 * (salary / p25));
  if (salary <= p50)
    return Math.round(25 + 25 * ((salary - p25) / (p50 - p25)));
  if (salary <= p75)
    return Math.round(50 + 25 * ((salary - p50) / (p75 - p50)));
  return Math.round(
    75 + 25 * Math.min((salary - p75) / (p75 * 0.5), 1)
  );
}

export function PercentileBar({
  p25,
  p50,
  p75,
  userSalary,
  label = "Gajimu",
}: PercentileBarProps) {
  const [animated, setAnimated] = useState(false);
  const userPosition = calcUserPosition(userSalary, p25, p75);
  const percentile = calcPercentile(userSalary, p25, p50, p75);

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

  const zone =
    userSalary < p25 ? "below" : userSalary <= p75 ? "fair" : "above";

  const zoneColor =
    zone === "below"
      ? "text-red-600 dark:text-red-400"
      : zone === "above"
      ? "text-blue-600 dark:text-blue-400"
      : "text-emerald-600 dark:text-emerald-400";

  const zoneBg =
    zone === "below"
      ? "bg-red-500"
      : zone === "above"
      ? "bg-blue-500"
      : "bg-emerald-500";

  const zoneLabel =
    zone === "below"
      ? "Di bawah rata-rata"
      : zone === "above"
      ? "Di atas rata-rata"
      : "Dalam rentang wajar";

  return (
    <figure
      role="img"
      aria-label={`Persentil gaji untuk ${label} di kota yang dipilih`}
      className="space-y-4"
    >
      <div className="text-center">
        <p className="text-4xl font-bold text-foreground">
          P<span className={zoneColor}>{percentile}</span>
        </p>
        <p className={cn("text-sm font-semibold mt-1", zoneColor)}>
          {zoneLabel}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Gajimu lebih tinggi dari {percentile}% karyawan dengan posisi & kota
          yang sama
        </p>
      </div>

      <div className="relative pt-8 pb-12">
        <div className="relative h-6 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800">
          <div className="absolute inset-y-0 left-0 w-[25%] bg-red-200 dark:bg-red-900/40" />
          <div className="absolute inset-y-0 left-[25%] right-[25%] bg-emerald-200 dark:bg-emerald-900/40" />
          <div className="absolute inset-y-0 right-0 w-[25%] bg-blue-200 dark:bg-blue-900/40" />
        </div>

        {[
          { marker: 25, label: "P25", value: p25 },
          { marker: 50, label: "P50", value: p50 },
          { marker: 75, label: "P75", value: p75 },
        ].map((marker) => {
          const barPos = calcUserPosition(marker.value, p25, p75);
          return (
            <div
              key={marker.label}
              className="absolute top-0 -translate-x-1/2 flex flex-col items-center"
              style={{ left: `${barPos}%` }}
            >
              <span className="text-xs text-muted-foreground font-medium">
                {marker.label}
              </span>
              <div className="w-0.5 h-8 bg-slate-300 dark:bg-slate-600 mt-1" />
              <span className="text-xs text-muted-foreground mt-9 -translate-x-1/2 whitespace-nowrap">
                {formatIDR(marker.value)}
              </span>
            </div>
          );
        })}

        <div
          className={cn(
            "absolute top-2 -translate-x-1/2 transition-all duration-1000 ease-out",
            animated ? "" : "opacity-0"
          )}
          style={{
            left: animated ? `${userPosition}%` : "0%",
          }}
        >
          <div
            className={cn(
              "w-4 h-4 rounded-full border-2 border-white shadow-lg",
              zoneBg
            )}
          />
          <div className="flex flex-col items-center mt-1">
            <div className="w-0.5 h-4 bg-slate-400" />
            <div
              className={cn(
                "text-xs font-bold whitespace-nowrap px-2 py-1 rounded-full text-white mt-0.5",
                zoneBg
              )}
            >
              {label}: {formatIDR(userSalary)}
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-4 justify-center text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-300 dark:bg-red-700" />
          <span className="text-muted-foreground">Di bawah pasar</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-emerald-300 dark:bg-emerald-700" />
          <span className="text-muted-foreground">Rentang wajar</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-blue-300 dark:bg-blue-700" />
          <span className="text-muted-foreground">Di atas pasar</span>
        </div>
      </div>

      <figcaption className="sr-only">
        Gajimu berada di persentil {percentile} dari total data. P25:{" "}
        {formatIDR(p25)}, Median: {formatIDR(p50)}, P75: {formatIDR(p75)}.
        {zoneLabel}.
      </figcaption>
    </figure>
  );
}
