"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cw_consent");
    if (!consent) setShow(true);
  }, []);

  const accept = () => {
    localStorage.setItem("cw_consent", "accepted:2026-03");
    setShow(false);
  };

  if (!show) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4 shadow-lg z-50"
      role="dialog"
      aria-label="Cookie consent"
    >
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          Kami menggunakan cookie esensial untuk fungsionalitas dasar.{" "}
          <a href="/privacy#cookie" className="text-primary hover:underline">
            Kebijakan Privasi
          </a>
        </p>
        <button
          onClick={accept}
          className={cn(
            "flex-shrink-0 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium",
            "hover:bg-primary/90 transition-colors",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          )}
        >
          Oke, Mengerti
        </button>
      </div>
    </div>
  );
}
