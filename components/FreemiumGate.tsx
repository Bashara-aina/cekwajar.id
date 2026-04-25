"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";

interface FreemiumGateProps {
  children: React.ReactNode;
  requiredTier?: "basic" | "pro";
  featureName?: string;
  hiddenLabel?: string;
  className?: string;
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
  hiddenLabel,
  className,
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
      <div className={cn("relative", className)}>
        <div className="blur-sm pointer-events-none select-none opacity-30">
          {children}
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-card/80 backdrop-blur-sm rounded-xl border shadow-lg p-4">
            <span className="animate-pulse text-sm text-muted-foreground">
              Memuat...
            </span>
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
    <div className={cn("relative", className)}>
      <div className="opacity-50">{children}</div>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="bg-card/95 backdrop-blur-sm rounded-xl border shadow-lg p-6 text-center max-w-sm mx-auto">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-6 h-6 text-primary" />
          </div>
          <h3 className="font-bold text-lg text-foreground mb-1">
            {hiddenLabel ?? `Selisih ${featureName} Tersembunyi`}
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Upgrade ke Basic untuk akses penuh ke{" "}
            <span className="font-medium text-foreground">{featureName}</span>
          </p>
          <Button
            onClick={handleUpgrade}
            className="w-full bg-primary hover:bg-primary/90"
          >
            Lihat Selisih — Rp 29K/bulan
          </Button>
          <p className="text-xs text-muted-foreground mt-2">
            Kurang dari 1 kopi per hari
          </p>
        </div>
      </div>
    </div>
  );
}
