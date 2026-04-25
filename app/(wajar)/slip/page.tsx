"use client";

import { useState } from "react";
import { ResultCard } from "@/components/ResultCard";
import { FileText, AlertTriangle } from "lucide-react";
import type { PayslipInput } from "@/lib/validators/pph21.schema";

type Violation = { code: string; severity: "CRITICAL" | "WARNING" | "INFO"; message: string };

interface PayslipResult {
  monthly_pph21: number;
  annual_gross: number;
  ppk: number;
  violations: Violation[];
}

export default function WajarSlipPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PayslipResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    const form = e.currentTarget;
    const data: PayslipInput = {
      gross_monthly: Number(form.gross_monthly.value),
      ptkp_status: form.ptkp_status.value as PayslipInput["ptkp_status"],
      npwp: form.npwp.checked,
      month: Number(form.month.value),
      year: Number(form.year.value),
      city: form.city.value,
      reported_pph21: form.reported_pph21.value
        ? Number(form.reported_pph21.value)
        : undefined,
    };

    try {
      const res = await fetch("/api/pph21", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(await res.text());
      setResult(await res.json());
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Calculation failed");
    } finally {
      setLoading(false);
    }
  }

  const verdictColor =
    result?.violations?.some((v: Violation) => v.severity === "CRITICAL")
      ? "red"
      : result?.violations?.some((v: Violation) => v.severity === "WARNING")
      ? "yellow"
      : "green";

  // Get verdict text for accessibility (color is not the only means of conveying info)
  const verdictText = result
    ? result.violations?.length > 0
      ? result.violations.some((v: Violation) => v.severity === "CRITICAL")
        ? "PERHATIAN: Ditemukan pelanggaran kritis pada slip gaji Anda"
        : "PERHATIAN: Ditemukan beberapa masalah pada slip gaji Anda"
      : "WAJAR: PPh21 dihitung dengan benar"
    : null;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">Wajar Slip</h1>
        <p className="text-gray-500 mt-1">
          Periksa apakah PPh21 di slip gaji Anda dihitung dengan benar
        </p>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl border shadow-sm p-6 space-y-4"
        aria-label="Form perhitungan PPh21"
      >
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="gross_monthly" className="text-sm font-medium text-gray-700">
              Gaji Bruto/bulan (Rp)
            </label>
            <input
              id="gross_monthly"
              name="gross_monthly"
              type="number"
              required
              min={0}
              placeholder="8.500.000"
              disabled={loading}
              className="border rounded-lg px-3 py-2 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
              aria-describedby="gross_monthly_hint"
            />
            <span id="gross_monthly_hint" className="text-xs text-gray-400">
              Masukkan gaji bruto bulanan sebelum potong
            </span>
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="ptkp_status" className="text-sm font-medium text-gray-700">
              Status PTKP
            </label>
            <select
              id="ptkp_status"
              name="ptkp_status"
              required
              defaultValue="TK0"
              disabled={loading}
              className="border rounded-lg px-3 py-2 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
              aria-describedby="ptkp_status_hint"
            >
              <option value="TK0">TK0 — Tidak Kawin</option>
              <option value="K0">K0 — Kawin</option>
              <option value="K1">K1 — Kawin + 1 tanggungan</option>
              <option value="K2">K2 — Kawin + 2 tanggungan</option>
              <option value="K3">K3 — Kawin + 3 tanggungan</option>
            </select>
            <span id="ptkp_status_hint" className="text-xs text-gray-400">
              Status pajak untuk menentukan PTKP
            </span>
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="month" className="text-sm font-medium text-gray-700">
              Bulan
            </label>
            <select
              id="month"
              name="month"
              required
              defaultValue={new Date().getMonth() + 1}
              disabled={loading}
              className="border rounded-lg px-3 py-2 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>
                  {new Date(2024, m - 1, 1).toLocaleString("id-ID", { month: "long" })}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="year" className="text-sm font-medium text-gray-700">
              Tahun
            </label>
            <input
              id="year"
              name="year"
              type="number"
              required
              min={2020}
              max={2030}
              defaultValue={new Date().getFullYear()}
              disabled={loading}
              className="border rounded-lg px-3 py-2 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="city" className="text-sm font-medium text-gray-700">
              Kota
            </label>
            <input
              id="city"
              name="city"
              type="text"
              required
              placeholder="Jakarta"
              disabled={loading}
              className="border rounded-lg px-3 py-2 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
              aria-describedby="city_hint"
            />
            <span id="city_hint" className="text-xs text-gray-400">
              Kota tempat bekerja
            </span>
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="reported_pph21" className="text-sm font-medium text-gray-700">
              PPh21 di slip (Rp){" "}
              <span className="text-gray-400 font-normal">(opsional)</span>
            </label>
            <input
              id="reported_pph21"
              name="reported_pph21"
              type="number"
              min={0}
              placeholder="Biarkan kosong jika tidak tahu"
              disabled={loading}
              className="border rounded-lg px-3 py-2 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
              aria-describedby="reported_pph21_hint"
            />
            <span id="reported_pph21_hint" className="text-xs text-gray-400">
              Isi jika ingin dibandingkan dengan perhitungan sistem
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <input
            id="npwp"
            name="npwp"
            type="checkbox"
            disabled={loading}
            className="rounded disabled:cursor-not-allowed"
            aria-describedby="npwp_hint"
          />
          <label htmlFor="npwp" className="text-sm">
            Punya NPWP
          </label>
          <span id="npwp_hint" className="text-xs text-gray-400">
            Centang jika Anda memiliki NPWP aktif
          </span>
        </div>

        <button
          type="submit"
          disabled={loading}
          aria-label={loading ? "Sedang menghitung PPh21, harap tunggu" : "Periksa slip gaji"}
          className="w-full bg-blue-600 text-white rounded-lg py-3 font-semibold hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <span className="animate-spin">⏳</span>
              Menghitung...
            </>
          ) : (
            "Periksa Slip Gaji"
          )}
        </button>
      </form>

      {/* Error */}
      {error && (
        <div
          role="alert"
          aria-live="polite"
          className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 text-sm"
        >
          <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      {/* Result */}
      {result ? (
        <div className="space-y-4" role="region" aria-label="Hasil perhitungan PPh21">
          <ResultCard
            title="PPh21 per Bulan"
            amount={result.monthly_pph21}
            amountLabel="PPh21 yang seharusnya dipotong"
            verdict={
              result.violations?.length > 0 ? "PERHATIAN" : "WAJAR"
            }
            verdictColor={verdictColor}
            violations={result.violations}
            icon={FileText}
          />

          {/* Accessibility: screen reader announcement of verdict */}
          <div className="sr-only" aria-live="polite">
            {verdictText}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <ResultCard
              title="Gaji Bruto Setahun"
              amount={result.annual_gross}
              amountLabel="Gross annual income"
            />
            <ResultCard
              title="PKP"
              amount={result.ppk}
              amountLabel="Penghasilan Kena Pajak"
            />
          </div>
        </div>
      ) : loading ? (
        /* Loading skeleton for result section */
        <div className="space-y-4 animate-pulse" role="status" aria-label="Memuat hasil">
          <div className="bg-white rounded-xl border shadow-sm p-6">
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-4" />
            <div className="h-8 bg-gray-200 rounded w-1/2 mb-2" />
            <div className="h-3 bg-gray-200 rounded w-1/4" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-xl border shadow-sm p-6">
              <div className="h-4 bg-gray-200 rounded w-2/3 mb-3" />
              <div className="h-6 bg-gray-200 rounded w-1/2" />
            </div>
            <div className="bg-white rounded-xl border shadow-sm p-6">
              <div className="h-4 bg-gray-200 rounded w-2/3 mb-3" />
              <div className="h-6 bg-gray-200 rounded w-1/2" />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
