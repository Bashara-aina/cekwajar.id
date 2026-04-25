"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@/lib/supabase/client";

interface FreemiumGateProps {
  children: React.ReactNode;
  requiredTier?: "basic" | "pro";
  featureName?: string;
}

const TIER_ORDER = ["free", "basic", "pro"] as const;
type Tier = (typeof TIER_ORDER)[number];

function tierOrdinal(tier: Tier): number {
  return TIER_ORDER.indexOf(tier);
}

function isTierAllowed(userTier: Tier | null, requiredTier: "basic" | "pro"): boolean {
  if (!userTier) return false;
  return tierOrdinal(userTier) >= tierOrdinal(requiredTier);
}

export function FreemiumGate({
  children,
  requiredTier = "basic",
  featureName = "Fitur ini",
}: FreemiumGateProps) {
  const [loading, setLoading] = useState(true);
  const [userTier, setUserTier] = useState<Tier | null>(null);

  useEffect(() => {
    async function checkTier() {
      try {
        const supabase = createBrowserClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setUserTier(null);
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from("users")
          .select("subscription_tier")
          .eq("id", user.id)
          .single();

        if (error) {
          console.error("[FreemiumGate] failed to fetch tier:", error);
          setUserTier(null);
        } else {
          setUserTier(data.subscription_tier as Tier);
        }
      } catch (err) {
        console.error("[FreemiumGate] auth check failed:", err);
        setUserTier(null);
      } finally {
        setLoading(false);
      }
    }

    checkTier();
  }, []);

  function handleUpgrade() {
    window.open("/pricing", "_blank");
  }

  if (loading) {
    return (
      <div className="relative">
        <div className="blur-sm pointer-events-none select-none opacity-30">
          {children}
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl border shadow-lg p-4">
            <span className="animate-pulse text-sm text-gray-400">Memuat...</span>
          </div>
        </div>
      </div>
    );
  }

  const allowed = isTierAllowed(userTier, requiredTier);
  if (allowed) {
    return <>{children}</>;
  }

  return (
    <div className="relative">
      {/* Blur overlay for free users */}
      <div className="blur-sm pointer-events-none select-none opacity-50">
        {children}
      </div>

      {/* Gate overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="bg-white/90 backdrop-blur-sm rounded-xl border shadow-lg p-6 text-center max-w-sm mx-auto">
          <div className="text-4xl mb-3">🔒</div>
          <h3 className="font-bold text-gray-900 mb-1">
            Upgrade untuk Akses Penuh
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            {featureName} tersedia untuk pengguna{" "}
            <span className="font-semibold text-blue-600">
              {requiredTier === "pro" ? "Pro" : "Basic"}
            </span>
          </p>
          <button
            onClick={handleUpgrade}
            className="w-full bg-blue-600 text-white rounded-lg py-2.5 font-semibold text-sm hover:bg-blue-700 cursor-pointer"
          >
            Upgrade Sekarang
          </button>
          <p className="text-xs text-gray-400 mt-2">
            Mulai dari Rp 29.000/bulan
          </p>
        </div>
      </div>
    </div>
  );
}
