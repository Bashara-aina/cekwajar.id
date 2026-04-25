import { Suspense } from "react";
import type { Metadata } from "next";
import UpgradePageClient from "./UpgradePageClient";

export const metadata: Metadata = {
  title: "Upgrade — cekwajar.id",
  description: "Upgrade ke paket Basic atau Pro untuk akses lengkap",
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
