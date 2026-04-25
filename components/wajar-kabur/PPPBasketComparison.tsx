"use client";

import { cn } from "@/lib/utils";

interface BasketItem {
  label: string;
  fromValue: string;
  toValue: string;
  fromBetter: boolean;
}

interface PPPBasketComparisonProps {
  fromCity: string;
  toCity: string;
  fromSalaryFormatted: string;
  toSalaryFormatted: string;
  pppRatio: number;
  basketItems: BasketItem[];
}

export function PPPBasketComparison({
  fromCity,
  toCity,
  fromSalaryFormatted,
  toSalaryFormatted,
  pppRatio,
  basketItems,
}: PPPBasketComparisonProps) {
  const ratioDisplay = (pppRatio * 100 - 100).toFixed(0);
  const isBetter = pppRatio > 1;

  return (
    <figure
      role="img"
      aria-label={`Purchasing power comparison ${fromCity} vs ${toCity}`}
      className="space-y-5"
    >
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-muted/50 rounded-xl p-4 text-center">
          <p className="text-xs text-muted-foreground mb-1">{fromCity}</p>
          <p className="text-xl font-bold">{fromSalaryFormatted}</p>
          <p className="text-xs text-muted-foreground mt-1">
            Daya beli lokal
          </p>
        </div>
        <div
          className={cn(
            "rounded-xl p-4 text-center border-2",
            isBetter
              ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200"
              : "bg-red-50 dark:bg-red-950/30 border-red-200"
          )}
        >
          <p className="text-xs text-muted-foreground mb-1">
            {toCity} (PPP)
          </p>
          <p
            className={cn(
              "text-xl font-bold",
              isBetter ? "text-emerald-700" : "text-red-700"
            )}
          >
            {toSalaryFormatted}
          </p>
          <p
            className={cn(
              "text-xs font-semibold mt-1",
              isBetter ? "text-emerald-600" : "text-red-600"
            )}
          >
            {isBetter ? `+${ratioDisplay}%` : `${ratioDisplay}%`} daya beli
          </p>
        </div>
      </div>

      <div>
        <p className="text-sm font-semibold text-muted-foreground mb-3">
          Dengan gaji tersebut, kamu bisa beli:
        </p>
        <div className="space-y-2">
          {basketItems.map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg"
            >
              <div className="flex-1">
                <p className="text-xs font-semibold text-muted-foreground">
                  {item.label}
                </p>
                <div className="flex gap-3 mt-1">
                  <span className="text-xs">
                    🇮🇩 <strong>{item.fromValue}</strong>
                  </span>
                  <span className="text-xs text-muted-foreground">vs</span>
                  <span
                    className={cn(
                      "text-xs font-semibold",
                      item.fromBetter ? "text-red-600" : "text-emerald-600"
                    )}
                  >
                    🌏 <strong>{item.toValue}</strong>
                  </span>
                </div>
              </div>
              <span className="text-lg">
                {item.fromBetter ? "📉" : "📈"}
              </span>
            </div>
          ))}
        </div>
      </div>

      <figcaption className="sr-only">
        Perbandingan daya beli antara {fromCity} dan {toCity}. Ratio PPP:{" "}
        {pppRatio.toFixed(2)}.{" "}
        {isBetter
          ? `${toCity} memiliki daya beli lebih tinggi`
          : `${fromCity} memiliki daya beli lebih tinggi`}
        .
      </figcaption>
    </figure>
  );
}
