"use client";

import { useState } from "react";
import { ResultCard } from "@/components/ResultCard";
import { FreemiumGate } from "@/components/FreemiumGate";

const CITY_COST_INDEX: Record<string, Record<string, number>> = {
  jakarta:   { rice_kg: 15000, chicken_kg: 38000, internet_month: 250000, transport_month: 200000, electricity_kwh: 1400, water_month: 50000 },
  surabaya:  { rice_kg: 14000, chicken_kg: 36000, internet_month: 230000, transport_month: 180000, electricity_kwh: 1300, water_month: 45000 },
  bandung:   { rice_kg: 14500, chicken_kg: 37000, internet_month: 220000, transport_month: 170000, electricity_kwh: 1350, water_month: 48000 },
  tangerang:{ rice_kg: 14500, chicken_kg: 37500, internet_month: 240000, transport_month: 190000, electricity_kwh: 1380, water_month: 50000 },
  bekasi:    { rice_kg: 14000, chicken_kg: 36000, internet_month: 220000, transport_month: 185000, electricity_kwh: 1300, water_month: 45000 },
  bali:      { rice_kg: 18000, chicken_kg: 45000, internet_month: 300000, transport_month: 150000, electricity_kwh: 1600, water_month: 80000 },
  singapore: { rice_kg: 4000, chicken_kg: 12000, internet_month: 450000, transport_month: 150000, electricity_kwh: 2800, water_month: 150000 },
  default:   { rice_kg: 15000, chicken_kg: 38000, internet_month: 250000, transport_month: 200000, electricity_kwh: 1400, water_month: 50000 },
};

interface CostBreakdown {
  category: string;
  items: { name: string; amount: number; unit: string }[];
  total: number;
}

export default function HidupPage() {
  const [form, setForm] = useState({
    monthly_income: "",
    family_members: "1",
    city: "jakarta",
  });
  const [customItems, setCustomItems] = useState<{ name: string; amount: string }[]>([]);
  const [result, setResult] = useState<{
    breakdown: CostBreakdown[];
    totalMonthly: number;
    goldPurchasingPower: number;
    verdict: "WAJAR" | "DI_BAWAH" | "MAHAMAL";
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const income = Number(form.monthly_income);
    const familySize = Number(form.family_members);
    const cityData = CITY_COST_INDEX[form.city.toLowerCase()] || CITY_COST_INDEX.default;

    const riceMonthly = familySize * 10 * cityData.rice_kg;
    const chickenMonthly = familySize * 4 * cityData.chicken_kg;
    const proteinMonthly = riceMonthly + chickenMonthly;

    const electricityMonthly = familySize * 80 * cityData.electricity_kwh;
    const waterMonthly = cityData.water_month;
    const internetMonthly = cityData.internet_month;
    const transportMonthly = cityData.transport_month;

    const utilities = electricityMonthly + waterMonthly + internetMonthly + transportMonthly;

    const customTotal = customItems.reduce(
      (sum, item) => sum + (Number(item.amount) || 0),
      0
    );

    // Living wage estimate (2 main meals/day, 2 people)
    const livingWage = proteinMonthly + utilities + customTotal;

    const breakdown: CostBreakdown[] = [
      {
        category: "Makanan & Protein",
        items: [
          { name: `Beras (${familySize * 10} kg/bulan)`, amount: riceMonthly, unit: "bulan" },
          { name: `Ayam/Daging (${familySize * 4} kg/bulan)`, amount: chickenMonthly, unit: "bulan" },
        ],
        total: proteinMonthly,
      },
      {
        category: "Utilitas",
        items: [
          { name: `Listrik (~${(familySize * 80).toFixed(0)} kWh)`, amount: electricityMonthly, unit: "bulan" },
          { name: `Air`, amount: waterMonthly, unit: "bulan" },
          { name: `Internet`, amount: internetMonthly, unit: "bulan" },
          { name: `Transport`, amount: transportMonthly, unit: "bulan" },
        ],
        total: utilities,
      },
    ];

    const totalMonthly = livingWage + customTotal;

    // Gold purchasing power: how many grams of gold can you buy with monthly income
    // Jakarta gold price ~Rp 1,500,000/gram (approximate)
    const goldPricePerGram = 1500000;
    const goldPurchasingPower = income / goldPricePerGram;

    const verdict =
      totalMonthly > income ? "MAHAMAL" :
      totalMonthly > income * 0.8 ? "DI_BAWAH" :
      "WAJAR";

    setResult({
      breakdown,
      totalMonthly,
      goldPurchasingPower,
      verdict,
    });

    setLoading(false);
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Wajar Hidup</h1>
        <p className="text-gray-500 text-sm mt-1">
          Breakdown biaya hidup bulanan
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Pendapatan Bulanan (Rp)
          </label>
          <input
            type="number"
            min="500000"
            max="1000000000"
            required
            placeholder="8000000"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
            value={form.monthly_income}
            onChange={(e) => setForm({ ...form, monthly_income: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Jumlah Keluarga
            </label>
            <select
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              value={form.family_members}
              onChange={(e) => setForm({ ...form, family_members: e.target.value })}
            >
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <option key={n} value={n}>{n} orang</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kota
            </label>
            <select
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
            >
              {Object.keys(CITY_COST_INDEX)
                .filter((k) => k !== "default" && k !== "singapore")
                .map((k) => (
                  <option key={k} value={k}>
                    {k.charAt(0).toUpperCase() + k.slice(1)}
                  </option>
                ))}
            </select>
          </div>
        </div>

        {/* Custom expense items */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Biaya Tambahan (opsional)
          </label>
          {customItems.map((item, idx) => (
            <div key={idx} className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="Nama biaya"
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm"
                value={item.name}
                onChange={(e) => {
                  const updated = [...customItems];
                  updated[idx].name = e.target.value;
                  setCustomItems(updated);
                }}
              />
              <input
                type="number"
                placeholder="Rp"
                className="w-32 rounded-lg border border-gray-300 px-3 py-2 text-sm"
                value={item.amount}
                onChange={(e) => {
                  const updated = [...customItems];
                  updated[idx].amount = e.target.value;
                  setCustomItems(updated);
                }}
              />
              <button
                type="button"
                onClick={() => setCustomItems(customItems.filter((_, i) => i !== idx))}
                className="text-red-500 text-sm px-2"
              >
                ✕
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setCustomItems([...customItems, { name: "", amount: "" }])}
            className="text-sm text-blue-600 underline"
          >
            + Tambah biaya
          </button>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white rounded-lg py-2.5 font-semibold text-sm hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Menghitung..." : "Hitung Biaya Hidup"}
        </button>
      </form>

      {result && (
        <FreemiumGate requiredTier="basic" featureName="Full breakdown">
          <div className="space-y-4">
            {/* Verdict */}
            <ResultCard
              title="Total Biaya Bulanan"
              amount={result.totalMonthly}
              verdict={result.verdict}
            />

            {/* Gold purchasing power */}
            <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-xl p-4">
              <div className="text-xs text-yellow-700 font-medium mb-1">
                Daya Beli Emas — Gold Purchasing Power
              </div>
              <div className="text-2xl font-black text-amber-700">
                {result.goldPurchasingPower.toFixed(2)} gram
              </div>
              <p className="text-xs text-yellow-600 mt-1">
                per bulan di {form.city}
              </p>
            </div>

            {/* Breakdown by category */}
            {result.breakdown.map((section) => (
              <div key={section.category} className="bg-white rounded-xl border">
                <div className="px-4 py-3 border-b flex justify-between items-center">
                  <span className="font-medium text-sm">{section.category}</span>
                  <span className="text-sm font-semibold text-gray-700">
                    {formatRupiah(section.total)}
                  </span>
                </div>
                <div className="divide-y">
                  {section.items.map((item) => (
                    <div key={item.name} className="px-4 py-2.5 flex justify-between text-sm">
                      <span className="text-gray-600">{item.name}</span>
                      <span className="font-medium">{formatRupiah(item.amount)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Summary verdict */}
            <div className={`rounded-xl border p-4 text-center text-sm font-semibold ${
              result.verdict === "WAJAR"
                ? "bg-green-50 border-green-200 text-green-700"
                : result.verdict === "DI_BAWAH"
                ? "bg-yellow-50 border-yellow-200 text-yellow-700"
                : "bg-red-50 border-red-200 text-red-700"
            }`}>
              {result.verdict === "WAJAR" && "Pendapatan mencukupi untuk biaya hidup wajar"}
              {result.verdict === "DI_BAWAH" && "Pendapatan cukup ketat — perlu tambahan atau penghematan"}
              {result.verdict === "MAHAMAL" && "Biaya hidup lebih besar dari pendapatan — tidak wajar"}
            </div>
          </div>
        </FreemiumGate>
      )}
    </div>
  );
}

function formatRupiah(val: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(val);
}
