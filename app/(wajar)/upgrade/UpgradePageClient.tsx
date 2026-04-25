"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { UPGRADE_COPY } from "@/lib/upgrade-copy";

declare global {
  interface Window {
    snap?: {
      pay: (token: string, options?: Record<string, unknown>) => void;
    };
  }
}

export default function UpgradePageClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const plan = searchParams.get("plan") ?? "basic";
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (plan !== "basic" && plan !== "pro") {
      router.replace("/pricing");
      return;
    }

    const script = document.createElement("script");
    script.src =
      "https://app.sandbox.midtrans.com/snap/snap.js";
    script.setAttribute(
      "data-client-key",
      process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY ?? "SB-Mid-client-placeholder"
    );
    script.async = true;
    script.onload = async () => {
      try {
        const res = await fetch("/api/midtrans/snap-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: `guest_${Date.now()}`,
            tier: plan,
          }),
        });

        if (!res.ok) {
          throw new Error("Gagal membuat token pembayaran");
        }

        const { token } = await res.json();

        if (window.snap) {
          window.snap.pay(token, {
            onSuccess: () => {
              router.push(`/upgrade/success?plan=${plan}`);
            },
            onPending: () => {
              setError("Pembayaran menunggu konfirmasi. Silakan selesaikan pembayaran Anda.");
              setLoading(false);
            },
            onError: () => {
              setError("Pembayaran gagal. Silakan coba lagi.");
              setLoading(false);
            },
            onClose: () => {
              setError("Pembayaran dibatalkan.");
              setLoading(false);
            },
          });
        } else {
          setError("Midtrans tidak tersedia. Silakan coba lagi nanti.");
          setLoading(false);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Terjadi kesalahan");
        setLoading(false);
      }
    };
    script.onerror = () => {
      setError("Gagal memuat pembayaran. Silakan coba lagi.");
      setLoading(false);
    };

    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [plan, router]);

  if (loading) {
    return (
      <div className="max-w-md mx-auto text-center py-16 space-y-4">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-emerald-600" />
        <p className="text-muted-foreground">
          Menyiapkan pembayaran...
        </p>
        <p className="text-xs text-muted-foreground">
          {plan === "pro" ? "Paket Pro — Rp 79K/bulan" : `${UPGRADE_COPY.priceLabel}`}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto space-y-6 text-center py-16">
      <PageHeader
        icon={CreditCard}
        title="Upgrade Gagal"
        description={error ?? "Terjadi kesalahan"}
      />
      <div className="space-y-3">
        <Button asChild className="w-full bg-emerald-600 hover:bg-emerald-700">
          <Link href="/pricing">Kembali ke Harga</Link>
        </Button>
        <Button asChild variant="outline" className="w-full">
          <Link href="/slip">Cek Slip Gaji</Link>
        </Button>
      </div>
    </div>
  );
}
