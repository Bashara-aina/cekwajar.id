"use client";

import { useState } from "react";
import { ResultCard } from "@/components/ResultCard";
import { FileText, AlertTriangle } from "lucide-react";
import type { PayslipInput } from "@/lib/validators/pph21.schema";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type Violation = { code: string; severity: "CRITICAL" | "WARNING" | "INFO"; message: string };

interface PayslipResult {
  monthly_pph21: number;
  annual_gross: number;
  ppk: number;
  violations: Violation[];
}

const PTKP_OPTIONS = [
  { value: "TK0", label: "TK0 — Tidak Kawin" },
  { value: "K0", label: "K0 — Kawin" },
  { value: "K1", label: "K1 — Kawin + 1 tanggungan" },
  { value: "K2", label: "K2 — Kawin + 2 tanggungan" },
  { value: "K3", label: "K3 — Kawin + 3 tanggungan" },
];

const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1).map((m) => ({
  value: m,
  label: new Date(2024, m - 1, 1).toLocaleString("id-ID", { month: "long" }),
}));

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
        <h1 className="text-2xl font-bold text-foreground">Wajar Slip</h1>
        <p className="text-muted-foreground mt-1">
          Periksa apakah PPh21 di slip gaji Anda dihitung dengan benar
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form
            onSubmit={handleSubmit}
            className="space-y-4"
            aria-label="Form perhitungan PPh21"
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="gross_monthly">Gaji Bruto/bulan (Rp)</Label>
                <Input
                  id="gross_monthly"
                  name="gross_monthly"
                  type="number"
                  required
                  min={0}
                  placeholder="8.500.000"
                  disabled={loading}
                  aria-describedby="gross_monthly_hint"
                />
                <p id="gross_monthly_hint" className="text-xs text-muted-foreground">
                  Masukkan gaji bruto bulanan sebelum potong
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ptkp_status">Status PTKP</Label>
                <Select name="ptkp_status" defaultValue="TK0" disabled={loading}>
                  <SelectTrigger id="ptkp_status" aria-describedby="ptkp_status_hint">
                    <SelectValue placeholder="Pilih status PTKP" />
                  </SelectTrigger>
                  <SelectContent>
                    {PTKP_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p id="ptkp_status_hint" className="text-xs text-muted-foreground">
                  Status pajak untuk menentukan PTKP
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="month">Bulan</Label>
                <Select name="month" defaultValue={String(new Date().getMonth() + 1)} disabled={loading}>
                  <SelectTrigger id="month">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MONTHS.map((m) => (
                      <SelectItem key={m.value} value={String(m.value)}>
                        {m.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="year">Tahun</Label>
                <Input
                  id="year"
                  name="year"
                  type="number"
                  required
                  min={2020}
                  max={2030}
                  defaultValue={new Date().getFullYear()}
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">Kota</Label>
                <Input
                  id="city"
                  name="city"
                  type="text"
                  required
                  placeholder="Jakarta"
                  disabled={loading}
                  aria-describedby="city_hint"
                />
                <p id="city_hint" className="text-xs text-muted-foreground">
                  Kota tempat bekerja
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reported_pph21">PPh21 di slip (Rp) <span className="text-muted-foreground font-normal">(opsional)</span></Label>
                <Input
                  id="reported_pph21"
                  name="reported_pph21"
                  type="number"
                  min={0}
                  placeholder="Biarkan kosong jika tidak tahu"
                  disabled={loading}
                  aria-describedby="reported_pph21_hint"
                />
                <p id="reported_pph21_hint" className="text-xs text-muted-foreground">
                  Isi jika ingin dibandingkan dengan perhitungan sistem
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                id="npwp"
                name="npwp"
                type="checkbox"
                disabled={loading}
                className={cn(
                  "h-4 w-4 rounded border-input",
                  "focus:ring-2 focus:ring-ring focus:ring-offset-2",
                  "disabled:cursor-not-allowed disabled:opacity-50"
                )}
                aria-describedby="npwp_hint"
              />
              <Label htmlFor="npwp" className="text-sm font-normal">
                Punya NPWP
              </Label>
              <span id="npwp_hint" className="text-xs text-muted-foreground">
                Centang jika Anda memiliki NPWP aktif
              </span>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full"
              aria-label={loading ? "Sedang menghitung PPh21, harap tunggu" : "Periksa slip gaji"}
            >
              {loading ? "Menghitung..." : "Periksa Slip Gaji"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {error && (
        <Card>
          <CardContent className="pt-4">
            <div
              role="alert"
              aria-live="polite"
              className="flex items-center gap-2 p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm"
            >
              <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

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
        <div className="space-y-4" role="status" aria-label="Memuat hasil">
          <Card>
            <CardContent className="pt-4 space-y-3">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-8 w-1/2" />
              <Skeleton className="h-3 w-1/4" />
            </CardContent>
          </Card>
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="pt-4 space-y-2">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-6 w-1/2" />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 space-y-2">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-6 w-1/2" />
              </CardContent>
            </Card>
          </div>
        </div>
      ) : null}
    </div>
  );
}
