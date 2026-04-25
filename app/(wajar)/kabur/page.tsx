"use client";

import { useState } from "react";
import { ResultCard } from "@/components/ResultCard";
import { FreemiumGate } from "@/components/FreemiumGate";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plane } from "lucide-react";

const CITIES = [
  { value: "jakarta", label: "Jakarta" },
  { value: "surabaya", label: "Surabaya" },
  { value: "bandung", label: "Bandung" },
  { value: "tangerang", label: "Tangerang" },
  { value: "bekasi", label: "Bekasi" },
  { value: "bali", label: "Bali" },
  { value: "singapore", label: "Singapore" },
  { value: "kuala_lumpur", label: "Kuala Lumpur" },
  { value: "bangkok", label: "Bangkok" },
  { value: "tokyo", label: "Tokyo" },
  { value: "hong_kong", label: "Hong Kong" },
];

export default function KaburPage() {
  const [form, setForm] = useState({
    current_city: "jakarta",
    target_city: "singapore",
  });
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const wbRes = await fetch(
        `/api/worldbank?current_city=${form.current_city}&target_city=${form.target_city}`
      );
      const wb = await wbRes.json();
      const feasibility = calculateFeasibility(wb);
      setResult({ wb, feasibility });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 p-6">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500 text-white">
            <Plane className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Wajar Kabur</h1>
          </div>
        </div>
        <p className="text-muted-foreground text-sm">
          Seberapa realistis pindah ke kota lain? Analisis PPP dan biaya hidup
          antar kota di Indonesia.
        </p>
      </div>

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="current_city">Kota Sekarang</Label>
                <Select
                  value={form.current_city}
                  onValueChange={(v) =>
                    setForm({ ...form, current_city: v })
                  }
                >
                  <SelectTrigger id="current_city">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CITIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="target_city">Kota Target</Label>
                <Select
                  value={form.target_city}
                  onValueChange={(v) =>
                    setForm({ ...form, target_city: v })
                  }
                >
                  <SelectTrigger id="target_city">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CITIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Menganalisis..." : "Analisis Kelayakan Pindah"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {result && (
        <FreemiumGate requiredTier="pro" featureName="Hasil analisis kabur">
          <KaburResult result={result} />
        </FreemiumGate>
      )}
    </div>
  );
}

function KaburResult({ result }: { result: Record<string, unknown> }) {
  const { wb, feasibility } = result as {
    wb: {
      current_city: { name: string; indicators: Record<string, number | null> };
      target_city: { name: string; indicators: Record<string, number | null> };
    };
    feasibility: {
      score: number;
      label: string;
      verdict: "WAJAR" | "SUSAH" | "MUSTAHIL";
    };
  };

  const current = wb.current_city;
  const target = wb.target_city;

  const costRatio =
    (target.indicators.cost_of_living || 100) /
    (current.indicators.cost_of_living || 100);

  const verdictConfig = {
    WAJAR: { color: "text-success", bg: "bg-success/10", border: "border-success/20" },
    SUSAH: { color: "text-warning", bg: "bg-warning/10", border: "border-warning/20" },
    MUSTAHIL: { color: "text-danger", bg: "bg-danger/10", border: "border-danger/20" },
  };
  const vcfg = verdictConfig[feasibility.verdict];

  return (
    <div className="space-y-4">
      {/* Feasibility Score */}
      <Card className={`border ${vcfg.border}`}>
        <CardContent className="p-6 text-center">
          <div className={`text-5xl font-black font-mono ${vcfg.color} mb-2`}>
            {feasibility.score}/10
          </div>
          <Badge className={`${vcfg.bg} ${vcfg.color} border-0 mb-2`}>
            {feasibility.label}
          </Badge>
          <p className="text-sm text-muted-foreground mt-1">
            Escape Feasibility Index — Seberapa realistis pindah ke kota lain
          </p>
        </CardContent>
      </Card>

      {/* Side-by-side comparison */}
      <div className="grid grid-cols-2 gap-4">
        {[
          { city: current, label: "Kota Sekarang" },
          { city: target, label: "Kota Target" },
        ].map(({ city, label }) => (
          <Card key={label}>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">
                {label}
              </CardTitle>
              <p className="font-semibold">{city.name}</p>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Cost of Living</span>
                <span className="font-medium font-mono">
                  {(city.indicators.cost_of_living || 0).toFixed(1)}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">GDP per capita</span>
                <span className="font-medium font-mono">
                  ${((city.indicators.gdp_per_capita || 0) / 1000).toFixed(0)}k
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Cost ratio analysis */}
      <ResultCard
        title="Rasio Biaya Hidup"
        amount={costRatio}
        verdict={
          costRatio < 1.3 ? "WAJAR" : costRatio < 2.0 ? "DI_ATAS" : "DI_BAWAH"
        }
        amountLabel={`${costRatio.toFixed(2)}x rasio biaya`}
      />

      {/* Insight */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-4">
          <p className="text-sm font-medium mb-1">Insight</p>
          {costRatio < 1.3 && (
            <p className="text-sm text-muted-foreground">
              Kota target memiliki biaya hidup yang mirip. Gaji lokal masih cukup
              untuk bertahan.
            </p>
          )}
          {costRatio >= 1.3 && costRatio < 2.0 && (
            <p className="text-sm text-muted-foreground">
              Biaya hidup di kota target lebih tinggi{" "}
              ~{(costRatio * 100 - 100).toFixed(0)}%. Pastikan negosiasi
              salary 30% lebih tinggi.
            </p>
          )}
          {costRatio >= 2.0 && (
            <p className="text-sm text-muted-foreground">
              Biaya hidup di kota target jauh lebih tinggi. Perlu salary yang
              sangat kompetitif atau tabungan besar.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function calculateFeasibility(
  wb: {
    current_city: { indicators: Record<string, number | null> };
    target_city: { indicators: Record<string, number | null> };
  }
): { score: number; label: string; verdict: "WAJAR" | "SUSAH" | "MUSTAHIL" } {
  const targetCost = wb.target_city.indicators.cost_of_living || 100;
  const currentCost = wb.current_city.indicators.cost_of_living || 100;
  const ratio = targetCost / currentCost;

  let score = 10 - (ratio - 1) * 5;
  score = Math.max(0, Math.min(10, score));

  const targetGDP = wb.target_city.indicators.gdp_per_capita || 5000;
  if (targetGDP > 30000) score += 1;
  if (targetGDP > 50000) score += 1;

  score = Math.max(0, Math.min(10, score));

  if (score >= 7)
    return {
      score: Math.round(score),
      label: "Cukup Realistis",
      verdict: "WAJAR",
    };
  if (score >= 4)
    return {
      score: Math.round(score),
      label: "Perlu Negosiasi",
      verdict: "SUSAH",
    };
  return {
    score: Math.round(score),
    label: "Susah Banget",
    verdict: "MUSTAHIL",
  };
}