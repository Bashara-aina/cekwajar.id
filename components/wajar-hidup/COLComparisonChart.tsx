"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { cn } from "@/lib/utils";

interface COLCategory {
  name: string;
  nameShort: string;
  fromCity: number;
  toCity: number;
  color: string;
}

interface COLComparisonChartProps {
  fromCity: string;
  toCity: string;
  categories: COLCategory[];
  totalFrom: number;
  totalTo: number;
}

function formatIDR(v: number): string {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}jt`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(0)}rb`;
  return v.toString();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload) return null;
  return (
    <div className="bg-background border rounded-lg shadow-lg p-3 text-xs">
      <p className="font-semibold mb-1">{label}</p>
      {payload.map((entry: { name: string; value: number; color: string }) => (
        <div
          key={entry.name}
          className="flex items-center justify-between gap-4"
        >
          <div className="flex items-center gap-1.5">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-muted-foreground">{entry.name}:</span>
          </div>
          <span className="font-mono font-semibold">
            Rp {formatIDR(entry.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

export function COLComparisonChart({
  fromCity,
  toCity,
  categories,
  totalFrom,
  totalTo,
}: COLComparisonChartProps) {
  const chartData = categories.map((cat) => ({
    name: cat.nameShort,
    [fromCity]: cat.fromCity,
    [toCity]: cat.toCity,
  }));

  const diff = totalTo - totalFrom;
  const diffPct = ((diff / totalFrom) * 100).toFixed(0);
  const isMoreExpensive = diff > 0;

  return (
    <figure
      role="img"
      aria-label={`Perbandingan biaya hidup ${fromCity} vs ${toCity}`}
      className="space-y-6"
    >
      <div
        className={cn(
          "rounded-xl border-2 p-5 text-center",
          isMoreExpensive
            ? "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800"
            : "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800"
        )}
      >
        <p
          className={cn(
            "text-2xl font-bold",
            isMoreExpensive
              ? "text-red-700 dark:text-red-400"
              : "text-emerald-700 dark:text-emerald-400"
          )}
        >
          {isMoreExpensive
            ? `${toCity} ${diffPct}% lebih mahal`
            : `${toCity} ${Math.abs(Number(diffPct))}% lebih murah`}
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          Selisih biaya hidup: Rp {formatIDR(Math.abs(diff))}/bulan
        </p>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={(v) => `${formatIDR(v)}`}
              tick={{ fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              width={48}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              formatter={(value) => (
                <span className="text-xs">{value}</span>
              )}
            />
            <Bar
              dataKey={fromCity}
              fill="#10b981"
              radius={[4, 4, 0, 0]}
              maxBarSize={28}
            />
            <Bar
              dataKey={toCity}
              fill="#6366f1"
              radius={[4, 4, 0, 0]}
              maxBarSize={28}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-2">
        {categories.map((cat) => {
          const catDiff = cat.toCity - cat.fromCity;
          const isUp = catDiff > 0;
          return (
            <div
              key={cat.name}
              className="flex items-center justify-between py-2 border-b border-muted last:border-0"
            >
              <span className="text-sm flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: cat.color }}
                />
                {cat.name}
              </span>
              <div className="text-right">
                <span
                  className={cn(
                    "text-xs font-semibold",
                    isUp ? "text-red-600" : "text-emerald-600"
                  )}
                >
                  {isUp ? "+" : "-"}Rp {formatIDR(Math.abs(catDiff))}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <figcaption className="sr-only">
        Perbandingan biaya hidup bulanan antara {fromCity} dan {toCity}.
        Total {fromCity}: Rp {totalFrom.toLocaleString("id-ID")}, Total{" "}
        {toCity}: Rp {totalTo.toLocaleString("id-ID")}. Selisih: Rp{" "}
        {Math.abs(diff).toLocaleString("id-ID")} (
        {isMoreExpensive ? "+" : "-"}
        {diffPct}%).
      </figcaption>
    </figure>
  );
}
