"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

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
    <div role="img" aria-label={`Grafik distribusi gaji: Anda di posisi ${Math.round((user / max) * 100)}%`}>
      <div className="relative h-4 bg-muted rounded-full overflow-hidden flex">
        {positions.map((p) => (
          <div
            key={p.label}
            className={cn("absolute w-2 h-4 rounded-full top-0", p.color)}
            style={{ left: `${Math.min((p.value / max) * 100, 100)}%` }}
            role="presentation"
            aria-label={`${p.label}: ${formatRupiah(p.value)}`}
          />
        ))}
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-xs text-muted-foreground">0</span>
        <span className="text-xs text-muted-foreground">P90</span>
      </div>
    </div>
  );
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
        <h1 className="text-2xl font-bold text-foreground">Wajar Gaji</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Bandingkan gaji kotor kamu dengan market rate
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="job_title">Job Title</Label>
              <Input
                id="job_title"
                type="text"
                required
                placeholder="Software Engineer, Data Analyst, ..."
                value={form.job_title}
                onChange={(e) => setForm({ ...form, job_title: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">Kota</Label>
                <Select value={form.city} onValueChange={(v) => setForm({ ...form, city: v })}>
                  <SelectTrigger id="city">
                    <SelectValue placeholder="Pilih kota" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="jakarta">Jakarta</SelectItem>
                    <SelectItem value="surabaya">Surabaya</SelectItem>
                    <SelectItem value="bandung">Bandung</SelectItem>
                    <SelectItem value="tangerang">Tangerang</SelectItem>
                    <SelectItem value="bekasi">Bekasi</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="experience_years">Tahun Pengalaman</Label>
                <Input
                  id="experience_years"
                  type="number"
                  min="0"
                  max="40"
                  required
                  placeholder="3"
                  value={form.experience_years}
                  onChange={(e) => setForm({ ...form, experience_years: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="gross_monthly">Gaji Kotor per Bulan (Rp)</Label>
              <Input
                id="gross_monthly"
                type="number"
                min="1000000"
                max="1000000000"
                required
                placeholder="15000000"
                value={form.gross_monthly}
                onChange={(e) => setForm({ ...form, gross_monthly: e.target.value })}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Menghitung..." : "Bandingkan Gaji"}
            </Button>
          </CardContent>
        </Card>
      </form>

      {result && (
        <div className="space-y-4">
          {result.benchmark?.benchmark ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Market Rate — P50 (Median)</CardTitle>
                  <CardDescription>Market P50</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-foreground">
                    {formatRupiah(result.benchmark.benchmark.gross_p50)}
                  </p>
                </CardContent>
              </Card>

              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "P50", value: result.benchmark.benchmark.gross_p50 },
                  { label: "P75", value: result.benchmark.benchmark.gross_p75 },
                  { label: "P90", value: result.benchmark.benchmark.gross_p90 },
                ].map((item) => (
                  <Card key={item.label}>
                    <CardContent className="pt-4 text-center">
                      <Badge variant="secondary" className="mb-2">{item.label}</Badge>
                      <p className="font-semibold text-sm">{formatRupiah(item.value)}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Posisi Kamu</CardTitle>
                  <CardDescription>
                    {result.percentile === "DI_BAWAH" ? (
                      <Badge variant="destructive">Di Bawah Market</Badge>
                    ) : result.percentile === "DI_ATAS" ? (
                      <Badge variant="success">Di Atas Market</Badge>
                    ) : (
                      <Badge variant="secondary">Wajar</Badge>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{formatRupiah(Number(form.gross_monthly))}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Distribusi</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <PercentileBar
                    user={Number(form.gross_monthly)}
                    p50={result.benchmark.benchmark.gross_p50}
                    p75={result.benchmark.benchmark.gross_p75}
                    p90={result.benchmark.benchmark.gross_p90}
                  />
                  <p className="text-xs text-muted-foreground">
                    Berdasarkan {result.benchmark.benchmark.sample_count} data sampel
                  </p>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
                  Belum ada data benchmark untuk posisi ini. Jadilah yang pertama contribute data!
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
