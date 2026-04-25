"use client";

import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6">
      <div className="text-center max-w-md space-y-6">
        <div className="flex justify-center">
          <div className="rounded-full bg-destructive/10 p-4">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">
            Terjadi Kesalahan
          </h1>
          <p className="text-muted-foreground text-sm">
            Maaf, terjadi kesalahan yang tidak terduga. Tim kami sudah
            notified dan akan memperbaiki secepatnya.
          </p>
        </div>

        {process.env.NODE_ENV === "development" && error?.message && (
          <details className="text-left bg-muted rounded-lg p-4 text-xs font-mono text-muted-foreground">
            <summary className="font-semibold cursor-pointer mb-2">
              Error detail (dev only)
            </summary>
            {error.message}
            {error.digest && (
              <p className="mt-2 text-destructive/70">
                Digest: {error.digest}
              </p>
            )}
          </details>
        )}

        <div className="flex gap-3 justify-center">
          <Button variant="outline" onClick={() => (window.location.href = "/")}>
            Kembali ke Beranda
          </Button>
          <Button onClick={reset} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Coba Lagi
          </Button>
        </div>
      </div>
    </div>
  );
}
