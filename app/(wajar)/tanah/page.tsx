"use client";

import { useState } from "react";
import { ResultCard } from "@/components/ResultCard";
import { Landmark, AlertTriangle, MapPin, Map, CheckSquare, ChevronLeft } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { TrustBadges } from "@/components/TrustBadges";
import { HowItWorks } from "@/components/HowItWorksTool";
import { CrossToolSuggestion } from "@/components/CrossToolSuggestion";

interface PropertyResult {
  price_per_m2: number;
  market_price_per_m2: number | null;
  verdict: "MURAH" | "WAJAR" | "MAHAMAL" | "TIDAK_TERSEDIA";
  verdict_code: string;
  ratio?: number | null;
  sample_count?: number;
}

interface ValidationError {
  field: string;
  message: string;
}

export default function WajarTanahPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PropertyResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);

  function validateForm(data: {
    city: string;
    property_type: string;
    price: number;
    area_m2: number;
  }): ValidationError[] {
    const errors: ValidationError[] = [];

    if (!data.city || data.city.trim().length === 0) {
      errors.push({ field: "city", message: "Kota harus diisi" });
    }

    if (!data.property_type) {
      errors.push({ field: "property_type", message: "Tipe properti harus dipilih" });
    }

    if (!data.price || data.price <= 0) {
      errors.push({ field: "price", message: "Harga harus lebih dari 0" });
    }

    if (!data.area_m2 || data.area_m2 <= 0) {
      errors.push({ field: "area_m2", message: "Luas harus lebih dari 0" });
    }

    return errors;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    setValidationErrors([]);

    const form = e.currentTarget;
    const data = {
      city: form.city.value,
      property_type: form.property_type.value,
      price: Number(form.price.value),
      area_m2: Number(form.area_m2.value),
    };

    // Validate inputs
    const errors = validateForm(data);
    if (errors.length > 0) {
      setValidationErrors(errors);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/property", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(await res.text());
      setResult(await res.json());
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Lookup failed");
    } finally {
      setLoading(false);
    }
  }

  const pricePerM2 = result?.price_per_m2;
  const marketPrice = result?.market_price_per_m2;
  const verdict = result?.verdict; // MURAH | WAJAR | MAHAMAL
  const verdictColor =
    verdict === "MURAH" ? "green" : verdict === "MAHAMAL" ? "red" : "yellow";

  function getFieldError(field: string): string | undefined {
    return validationErrors.find((e) => e.field === field)?.message;
  }

  return (
    <div data-tool="wajar-tanah" className="max-w-2xl mx-auto space-y-6 bg-teal-50 dark:bg-teal-950/20 rounded-xl p-4 sm:p-6">
      <PageHeader
        icon={Landmark}
        title="Cek Tanah"
        description="Cek harga tanah di zona lokasi kamu"
      />

      <TrustBadges />

      <HowItWorks steps={[
        { icon: MapPin, title: "Input lokasi tanah", description: "Masukkan alamat atau koordinat tanah" },
        { icon: Map, title: "Pilih zona", description: "Hijau (subsidi) / Media / Merah (non-subsidi)" },
        { icon: CheckSquare, title: "Cek harga pasar", description: "Lihat estimasi harga per m2 sesuai zona" },
      ]} />

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl border shadow-sm p-6 space-y-4"
      >
        <div className="grid grid-cols-2 gap-4">
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-gray-700">Kota</span>
            <input
              name="city"
              type="text"
              required
              placeholder="Jakarta Selatan"
              className={`border rounded-lg px-3 py-2 text-sm ${
                getFieldError("city") ? "border-red-500 ring-1 ring-red-500" : ""
              }`}
            />
            {getFieldError("city") && (
              <span className="text-xs text-red-600">{getFieldError("city")}</span>
            )}
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-gray-700">Tipe Properti</span>
            <select
              name="property_type"
              required
              defaultValue="tanah"
              className={`border rounded-lg px-3 py-2 text-sm ${
                getFieldError("property_type") ? "border-red-500 ring-1 ring-red-500" : ""
              }`}
            >
              <option value="tanah">Tanah</option>
              <option value="rumah">Rumah</option>
              <option value="apartemen">Apartemen</option>
              <option value="ruko">Ruko</option>
            </select>
            {getFieldError("property_type") && (
              <span className="text-xs text-red-600">{getFieldError("property_type")}</span>
            )}
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-gray-700">Harga (Rp)</span>
            <input
              name="price"
              type="number"
              required
              min={1}
              placeholder="500.000.000"
              className={`border rounded-lg px-3 py-2 text-sm ${
                getFieldError("price") ? "border-red-500 ring-1 ring-red-500" : ""
              }`}
            />
            {getFieldError("price") && (
              <span className="text-xs text-red-600">{getFieldError("price")}</span>
            )}
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-gray-700">Luas (m²)</span>
            <input
              name="area_m2"
              type="number"
              required
              min={1}
              placeholder="120"
              className={`border rounded-lg px-3 py-2 text-sm ${
                getFieldError("area_m2") ? "border-red-500 ring-1 ring-red-500" : ""
              }`}
            />
            {getFieldError("area_m2") && (
              <span className="text-xs text-red-600">{getFieldError("area_m2")}</span>
            )}
          </label>
        </div>

        {validationErrors.length > 0 && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm font-medium text-red-800 mb-1">Mohon perbaiki kesalahan berikut:</p>
            <ul className="text-sm text-red-700 space-y-1">
              {validationErrors.map((err, idx) => (
                <li key={idx}>• {err.message}</li>
              ))}
            </ul>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white rounded-lg py-3 font-semibold hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Mengecek..." : "Cek Harga Wajar"}
        </button>
      </form>

      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 text-sm">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {result && pricePerM2 && (
        <div className="space-y-4">
          <button
            type="button"
            onClick={() => { setResult(null); setError(null); setValidationErrors([]); }}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Cek lagi
          </button>
          <ResultCard
            title="Harga per m²"
            amount={pricePerM2}
            verdict={verdict}
            verdictColor={verdictColor}
            icon={Landmark}
          />

          {marketPrice && (
            <div className="bg-white rounded-xl border shadow-sm p-5">
              <p className="text-sm text-gray-500 mb-2">Harga pasar rata-rata</p>
              <p className="text-2xl font-bold text-gray-900">
                Rp {marketPrice.toLocaleString("id-ID")}/m²
              </p>
            </div>
          )}
        </div>
      )}

      <CrossToolSuggestion fromTool="tanah" />
    </div>
  );
}
