"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

interface MarketingAnalyticsProps {
  GA4_ID?: string;
  TikTokPixelID?: string;
  MetaPixelID?: string;
}

export function MarketingAnalytics({
  GA4_ID,
  TikTokPixelID,
  MetaPixelID,
}: MarketingAnalyticsProps) {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const fireEvent = (event: string, params?: Record<string, unknown>) => {
      if (GA4_ID && typeof window.gtag !== "undefined") {
        window.gtag("event", event, params);
      }
      if (TikTokPixelID && typeof window.ttq !== "undefined") {
        window.ttq.track(event, params);
      }
      if (MetaPixelID && typeof window.fbq !== "undefined") {
        window.fbq("track", event, params);
      }
    };

    fireEvent("page_view", { page_path: pathname });
  }, [pathname, GA4_ID, TikTokPixelID, MetaPixelID]);

  return null;
}

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    ttq?: {
      track: (event: string, params?: Record<string, unknown>) => void;
      page: (params?: Record<string, unknown>) => void;
    };
    fbq?: (...args: unknown[]) => void;
  }
}

export function initGTM(GA4_ID: string) {
  if (typeof window === "undefined" || window.gtag) return;
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`;
  document.head.appendChild(script);
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer!.push(args);
  };
  window.gtag("js", new Date());
  window.gtag("config", GA4_ID);
}

export function initTikTokPixel(_TikTokPixelID: string) {
  if (typeof window === "undefined" || window.ttq) return;
  window.ttq = {
    track: (event: string, params?: Record<string, unknown>) => {
      console.log("[TikTok Pixel]", event, params);
    },
    page: (params?: Record<string, unknown>) => {
      console.log("[TikTok Page]", params);
    },
  };
}

export function initMetaPixel(MetaPixelID: string) {
  if (typeof window === "undefined" || window.fbq) return;
  window.fbq = function fbq(...args: unknown[]) {
    console.log("[Meta Pixel]", ...args);
  };
  window.fbq("init", MetaPixelID);
  window.fbq("track", "PageView");
}