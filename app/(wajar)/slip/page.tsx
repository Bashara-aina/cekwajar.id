"use client";

import { useState } from "react";
import { ResultCard } from "@/components/ResultCard";
import { FileText, AlertTriangle, Receipt, ChevronLeft } from "lucide-react";
import { FormProgress } from "@/components/FormProgress";
import { PageHeader } from "@/components/PageHeader";
import { TrustBadges } from "@/components/TrustBadges";
import { HowItWorks } from "@/components/HowItWorksTool";

import { ViolationSummaryBanner } from "@/components/ViolationSummaryBanner";
import { SampleResultTeaser } from "@/components/SampleResultTeaser";
import { ShareVerdictButton } from "@/components/ShareVerdictButton";
import { ResultSkeleton } from "@/components/ResultSkeleton";
import { DisclaimerBanner } from "@/components/DisclaimerBanner";
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
import { cn } from "@/lib/utils";
import { COPY } from "@/lib/copy";

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
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PayslipResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleNextStep() {
    if (currentStep < 3) setCurrentStep((s) => s + 1);
  }

  function handlePrevStep() {
    if (currentStep > 1) setCurrentStep((s) => s - 1);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    setCurrentStep(1);

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
      setError(err instanceof Error ? err.message : COPY.errors.calculation_failed);
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

  const hasCritical = result?.violations?.some((v: Violation) => v.severity === "CRITICAL");
  const verdictText = result
    ? result.violations?.length > 0
      ? hasCritical
        ? COPY.verdict.slip_pelanggaran.replace("{count}", String(result.violations.length))
        : COPY.verdict.slip_pelanggaran.replace("{count}", String(result.violations.length))
      : COPY.verdict.slip_sesuai
    : null;

  return (
    <div data-tool="wajar-slip" className="max-w-2xl mx-auto space-y-6 bg-amber-50 dark:bg-amber-950/20 rounded-xl p-4 sm:p-6">
      <PageHeader
        icon={Receipt}
        title="Cek Slip Gaji"
        description="Pastikan payroll kamu sesuai UU Ketenagakerjaan"
      />
      <TrustBadges />

      <HowItWorks
        steps={[
          { icon: FileText, title: "Input data slip", description: "Masukkan data dari slip gaji kamu" },
          { icon: AlertTriangle, title: "Deteksi pelanggaran", description: "Cek kepatuhan PPh21 & BPJS" },
          { icon: FileText, title: "Dapatkan hasil", description: "Lihat detail pelanggaran dan rekomendasi" },
        ]}
      />

      <SampleResultTeaser />

      <Card>
        <CardContent className="pt-6">
          <form
            onSubmit={handleSubmit}
            className="space-y-4"
            aria-label="Form perhitungan PPh21"
          >
            <FormProgress
              currentStep={currentStep}
              totalSteps={3}
              labels={["Periode", "Data Pendapatan", "Verifikasi"]}
            />

            {currentStep === 1 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    inputMode="numeric"
                    defaultValue={new Date().getFullYear()}
                    disabled={loading}
                  />
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="gross_monthly">Gaji Bruto/bulan (Rp)</Label>
                  <Input
                    id="gross_monthly"
                    name="gross_monthly"
                    type="number"
                    required
                    min={0}
                    inputMode="numeric"
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

                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="city">Kota/Kabupaten</Label>
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
              </div>
            )}

            {currentStep === 3 && (
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="reported_pph21">PPh21 di slip (Rp) <span className="text-muted-foreground font-normal">(opsional)</span></Label>
                  <Input
                    id="reported_pph21"
                    name="reported_pph21"
                    type="number"
                    inputMode="numeric"
                    min={0}
                    placeholder="Biarkan kosong jika tidak tahu"
                    disabled={loading}
                    aria-describedby="reported_pph21_hint"
                  />
                  <p id="reported_pph21_hint" className="text-xs text-muted-foreground">
                    Isi jika ingin dibandingkan dengan perhitungan sistem
                  </p>
                </div>

                <fieldset className="border-0 p-0 m-0 space-y-2">
                  <legend className="sr-only">Status NPWP</legend>
                  <div className="flex items-center gap-2">
                    <input
                      id="npwp"
                      name="npwp"
                      type="checkbox"
                      defaultChecked={true}
                      disabled={loading}
                      className={cn(
                        "h-4 w-4 rounded border-input",
                        "focus:ring-2 focus:ring-ring focus:ring-offset-2",
                        "disabled:cursor-not-allowed disabled:opacity-50"
                      )}
                      aria-describedby="npwp_hint"
                    />
                    <Label htmlFor="npwp" className="text-sm font-normal cursor-pointer">
                      Punya NPWP
                    </Label>
                    <span id="npwp_hint" className="text-xs text-muted-foreground">
                      Centang jika Anda memiliki NPWP aktif
                    </span>
                  </div>
                </fieldset>
              </div>
            )}

            <div className="flex gap-3">
              {currentStep > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrevStep}
                  disabled={loading}
                  className="flex-1"
                >
                  ← Kembali
                </Button>
              )}
              {currentStep < 3 ? (
                <Button
                  type="button"
                  onClick={handleNextStep}
                  disabled={loading}
                  className="flex-1"
                >
                  Lanjut →
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1"
                  aria-label={loading ? COPY.loading.slip : COPY.cta.cek_slip}
                >
                  {loading ? COPY.loading.slip : COPY.cta.cek_slip}
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <DisclaimerBanner type="tax" />

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
        <div className="space-y-4" aria-live="polite" aria-atomic="true" aria-label="Hasil audit slip gaji">
          <button
            type="button"
            onClick={() => { setResult(null); setError(null); setCurrentStep(1); }}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Cek lagi
          </button>
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

          {result.violations && result.violations.length > 0 && (
            <ViolationSummaryBanner
              violations={result.violations.map(v => ({
                code: v.code,
                title: v.message,
                severity: v.severity,
              }))}
            />
          )}

          <ShareVerdictButton
            verdict={verdictText ?? ""}
            toolName="Wajar Slip"
            className="w-full"
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
        <ResultSkeleton />
      ) : null}
    </div>
  );
}
