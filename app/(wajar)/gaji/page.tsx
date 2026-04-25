"use client";

import { useState } from "react";
import { ResultCard } from "@/components/ResultCard";
import { FreemiumGate } from "@/components/FreemiumGate";

interface BenchmarkResult {
  benchmark: {
    job_title: string;
    city: string;
    industry: string;
    experience_years: number;
    gross_p50: number;
    gross_p75: number;
    gross_p90: number;
    sample_count: number;
  } | null;
}

interface GajiResult {
  benchmark: BenchmarkResult;
  pph21: unknown;
  percentile: "DI_BAWAH" | "WAJAR" | "DI_ATAS";
}

export default function GajiPage() {
  const [form, setForm] = useState({
    job_title: "",
    city: "jakarta",
    experience_years: "",
    gross_monthly: "",
  });
  const [result, setResult] = useState<GajiResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const [benchmarkRes, pph21Res] = await Promise.all([
        fetch("/api/salary-benchmark", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }),
        fetch("/api/pph21", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            gross_monthly: Number(form.gross_monthly),
            ptkp_status: "TK0",
            month: new Date().getMonth() + 1,
            year: new Date().getFullYear(),
            city: form.city,
            npwp: false,
          }),
        }),
      ]);

      const benchmark: BenchmarkResult = await benchmarkRes.json();
      const pph21 = await pph21Res.json();

      setResult({
        benchmark,
        pph21,
        percentile: calculatePercentile(
          Number(form.gross_monthly),
          benchmark.benchmark?.gross_p50,
          benchmark.benchmark?.gross_p75,
          benchmark.benchmark?.gross_p90
        ),
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Wajar Gaji</h1>
        <p className="text-gray-500 text-sm mt-1">
          Bandingkan gaji kotor kamu dengan market rate
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Job Title
          </label>
          <input
            type="text"
            required
            placeholder="Software Engineer, Data Analyst, ..."
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={form.job_title}
            onChange={(e) => setForm({ ...form, job_title: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kota
            </label>
            <select
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
            >
              <option value="jakarta">Jakarta</option>
              <option value="surabaya">Surabaya</option>
              <option value="bandung">Bandung</option>
              <option value="tangerang">Tangerang</option>
              <option value="bekasi">Bekasi</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tahun Pengalaman
            </label>
            <input
              type="number"
              min="0"
              max="40"
              required
              placeholder="3"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
              value={form.experience_years}
              onChange={(e) => setForm({ ...form, experience_years: e.target.value })}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Gaji Kotor per Bulan (Rp)
          </label>
          <input
            type="number"
            min="1000000"
            max="1000000000"
            required
            placeholder="15000000"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
            value={form.gross_monthly}
            onChange={(e) => setForm({ ...form, gross_monthly: e.target.value })}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white rounded-lg py-2.5 font-semibold text-sm hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Menghitung..." : "Bandingkan Gaji"}
        </button>
      </form>

      {result && (
        <FreemiumGate requiredTier="basic" featureName="Hasil benchmark">
          <div className="space-y-4">
            {result.benchmark?.benchmark ? (
              <>
                <ResultCard
                  title="Market Rate — P50 (Median)"
                  amount={result.benchmark.benchmark.gross_p50}
                  amountLabel="Market P50"
                />
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <div className="text-xs text-gray-500 mb-1">P50</div>
                    <div className="font-semibold text-sm">
                      {formatRupiah(result.benchmark.benchmark.gross_p50)}
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <div className="text-xs text-gray-500 mb-1">P75</div>
                    <div className="font-semibold text-sm">
                      {formatRupiah(result.benchmark.benchmark.gross_p75)}
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <div className="text-xs text-gray-500 mb-1">P90</div>
                    <div className="font-semibold text-sm">
                      {formatRupiah(result.benchmark.benchmark.gross_p90)}
                    </div>
                  </div>
                </div>
                <ResultCard
                  title="Posisi Kamu"
                  amount={Number(form.gross_monthly)}
                  amountLabel="Gaji kamu"
                  verdict={result.percentile === "DI_BAWAH" ? "DI_BAWAH" : result.percentile === "DI_ATAS" ? "DI_ATAS" : "WAJAR"}
                />
                <div className="bg-white rounded-xl border p-4">
                  <div className="text-sm font-medium mb-2">Distribusi</div>
                  <PercentileBar
                    user={Number(form.gross_monthly)}
                    p50={result.benchmark.benchmark.gross_p50}
                    p75={result.benchmark.benchmark.gross_p75}
                    p90={result.benchmark.benchmark.gross_p90}
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Berdasarkan {result.benchmark.benchmark.sample_count} data样本
                  </p>
                </div>
              </>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-800">
                Belum ada data benchmark untuk posisi ini. Jadilah yang pertama contribute data!
              </div>
            )}
          </div>
        </FreemiumGate>
      )}
    </div>
  );
}

function calculatePercentile(
  userSalary: number,
  p50?: number,
  p75?: number,
  p90?: number
): "DI_BAWAH" | "WAJAR" | "DI_ATAS" {
  if (!p50) return "WAJAR";
  if (userSalary < p50 * 0.8) return "DI_BAWAH";
  if (p90 && userSalary > p90) return "DI_ATAS";
  return "WAJAR";
}

function formatRupiah(val: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(val);
}

function PercentileBar({
  user,
  p50,
  p75,
  p90,
}: {
  user: number;
  p50: number;
  p75: number;
  p90: number;
}) {
  const max = p90 * 1.2;
  const positions = [
    { label: "P50", value: p50, color: "bg-blue-400" },
    { label: "P75", value: p75, color: "bg-blue-600" },
    { label: "P90", value: p90, color: "bg-blue-800" },
    { label: "Kamu", value: user, color: "bg-red-500" },
  ];

  return (
    <div>
      <div className="relative h-4 bg-gray-100 rounded-full overflow-hidden flex">
        {positions.map((p) => (
          <div
            key={p.label}
            className={`absolute w-2 h-4 rounded-full top-0 ${p.color}`}
            style={{ left: `${Math.min((p.value / max) * 100, 100)}%` }}
          />
        ))}
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-xs text-gray-400">0</span>
        <span className="text-xs text-gray-400">P90</span>
      </div>
    </div>
  );
}
