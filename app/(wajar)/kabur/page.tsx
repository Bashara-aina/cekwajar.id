"use client";

import { useState } from "react";
import { ResultCard } from "@/components/ResultCard";
import { FreemiumGate } from "@/components/FreemiumGate";

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
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Wajar Kabur</h1>
        <p className="text-gray-500 text-sm mt-1">
         逃走可行性 — Seberapa realistis pindah ke kota lain?
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kota Sekarang
            </label>
            <select
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              value={form.current_city}
              onChange={(e) => setForm({ ...form, current_city: e.target.value })}
            >
              {CITIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kota Target
            </label>
            <select
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              value={form.target_city}
              onChange={(e) => setForm({ ...form, target_city: e.target.value })}
            >
              {CITIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white rounded-lg py-2.5 font-semibold text-sm hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Menganalisis..." : "Analisis Kelayakan"}
        </button>
      </form>

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
    feasibility: { score: number; label: string; verdict: "WAJAR" | "SUSAH" | "MUSTAHIL" };
  };

  const current = wb.current_city;
  const target = wb.target_city;

  const costRatio =
    (target.indicators.cost_of_living || 100) /
    (current.indicators.cost_of_living || 100);

  return (
    <div className="space-y-4">
      {/* Feasibility Score */}
      <div className="bg-white rounded-xl border p-6 text-center">
        <div className="text-4xl font-black text-blue-600 mb-1">
          {feasibility.score}/10
        </div>
        <div className={`text-lg font-bold ${
          feasibility.verdict === "WAJAR" ? "text-green-600" :
          feasibility.verdict === "SUSAH" ? "text-yellow-600" : "text-red-600"
        }`}>
          {feasibility.label}
        </div>
        <p className="text-sm text-gray-500 mt-1">
          逃走可行性 — Escape Feasibility Index
        </p>
      </div>

      {/* Side-by-side comparison */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border p-4">
          <div className="text-xs text-gray-500 mb-2">Kota Sekarang</div>
          <div className="font-bold text-sm mb-3">{current.name}</div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-500">Cost of Living</span>
              <span className="font-medium">
                {(current.indicators.cost_of_living || 0).toFixed(1)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">GDP per capita</span>
              <span className="font-medium">
                ${((current.indicators.gdp_per_capita || 0) / 1000).toFixed(0)}k
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border p-4">
          <div className="text-xs text-gray-500 mb-2">Kota Target</div>
          <div className="font-bold text-sm mb-3">{target.name}</div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-500">Cost of Living</span>
              <span className="font-medium">
                {(target.indicators.cost_of_living || 0).toFixed(1)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">GDP per capita</span>
              <span className="font-medium">
                ${((target.indicators.gdp_per_capita || 0) / 1000).toFixed(0)}k
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Cost ratio analysis */}
      <ResultCard
        title="Rasio Biaya Hidup"
        amount={costRatio}
        verdict={
          costRatio < 1.3 ? "WAJAR" : costRatio < 2.0 ? "DI_ATAS" : "DI_BAWAH"
        }
        amountLabel={`${costRatio.toFixed(2)}x cost ratio`}
      />

      <div className="bg-blue-50 rounded-xl border border-blue-200 p-4 text-sm text-blue-800">
        <div className="font-semibold mb-1">💡 Insight</div>
        {costRatio < 1.3 && (
          <p>Kota target memiliki biaya hidup yang mirip. Gaji lokal masih cukup untuk bertahan.</p>
        )}
        {costRatio >= 1.3 && costRatio < 2.0 && (
          <p>Biaya hidup di kota target lebih tinggi ~{(costRatio * 100 - 100).toFixed(0)}%. Pastikan negotiate salary 30% lebih tinggi.</p>
        )}
        {costRatio >= 2.0 && (
          <p>Biaya hidup di kota target jauh lebih tinggi. Perlu salary yang sangat kompetitif atautabungan besar.</p>
        )}
      </div>
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

  // Score from 0-10
  let score = 10 - (ratio - 1) * 5;
  score = Math.max(0, Math.min(10, score));

  // Bonus for GDP per capita (higher = more salary potential)
  const targetGDP = wb.target_city.indicators.gdp_per_capita || 5000;
  if (targetGDP > 30000) score += 1;
  if (targetGDP > 50000) score += 1;

  score = Math.max(0, Math.min(10, score));

  if (score >= 7) return { score: Math.round(score), label: "Cuku七 Terbang", verdict: "WAJAR" };
  if (score >= 4) return { score: Math.round(score), label: "Perlu Negotiasi", verdict: "SUSAH" };
  return { score: Math.round(score), label: "Susah Banget", verdict: "MUSTAHIL" };
}
