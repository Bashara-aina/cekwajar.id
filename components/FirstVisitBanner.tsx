"use client";

import { useState } from "react";
import { X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FirstVisitBannerProps {
  message?: string;
  ctaText?: string;
  ctaHref?: string;
  cookieKey?: string;
  className?: string;
}

export function FirstVisitBanner({
  message = "Baru pertama kali di sini? Mulai dengan cek slip gaji kamu — hanya 30 detik.",
  ctaText = "Cek Sekarang",
  ctaHref = "/slip",
  cookieKey = "cw_first_visit",
  className,
}: FirstVisitBannerProps) {
  const [visible, setVisible] = useState(() => {
    if (typeof window !== "undefined") {
      return !localStorage.getItem(cookieKey);
    }
    return true;
  });

  if (!visible) return null;

  const dismiss = () => {
    localStorage.setItem(cookieKey, "1");
    setVisible(false);
  };

  return (
    <div
      className={cn(
        "relative flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 animate-fade-in-up",
        className
      )}
      role="banner"
    >
      <div className="flex items-center gap-2 flex-1">
        <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" aria-hidden="true" />
        <p className="text-sm text-emerald-800 dark:text-emerald-300">{message}</p>
      </div>
      <div className="flex items-center gap-2 ml-0 sm:ml-auto">
        <Button
          asChild
          size="sm"
          className="bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          <a href={ctaHref}>{ctaText} →</a>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={dismiss}
          aria-label="Tutup banner"
          className="h-8 w-8 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-100"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
