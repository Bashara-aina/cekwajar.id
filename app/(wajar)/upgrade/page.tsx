import { Suspense } from "react";
import type { Metadata } from "next";
import UpgradePageClient from "./UpgradePageClient";

export const metadata: Metadata = {
  title: "Buka Detail Slip Gajimu — IDR 49.000 / bulan · cekwajar.id",
  description:
    "Lihat detail rupiah selisih + skrip ke HRD. Garansi 7 hari uang kembali. Pembayaran via Midtrans.",
  alternates: { canonical: "https://cekwajar.id/upgrade" },
  openGraph: {
    title: "Pro IDR 49.000 — Buka detail slip gajimu",
    description: "Garansi 7 hari uang kembali. Batalkan kapan saja.",
    type: "website",
  },
};

export default function UpgradePage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-md mx-auto text-center py-16">
          <p className="text-muted-foreground">Memuat...</p>
        </div>
      }
    >
      <UpgradePageClient />
    </Suspense>
  );
}