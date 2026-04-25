import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Pembayaran Berhasil — cekwajar.id",
  description: "Selamat! Pembayaran kamu sudah terkonfirmasi.",
};

export default function PaymentSuccessPage() {
  return (
    <div className="max-w-lg mx-auto space-y-8 text-center py-12">
      {/* Success icon */}
      <div className="flex justify-center">
        <div className="relative">
          <div className="h-20 w-20 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
            <CheckCircle2 className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="absolute inset-0 h-20 w-20 rounded-full bg-emerald-100 dark:bg-emerald-900/50 animate-ping opacity-30" />
        </div>
      </div>

      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Pembayaran Berhasil!</h1>
        <p className="text-muted-foreground">
          Terima kasih sudah upgrade ke paket premium cekwajar.id.
        </p>
      </div>

      {/* Details card */}
      <Card>
        <CardContent className="pt-4 space-y-3 text-left">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Status</span>
            <span className="font-medium text-emerald-600 dark:text-emerald-400">
              ✓ Aktif
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Paket</span>
            <span className="font-medium">Basic / Pro</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Masa aktif</span>
            <span className="font-medium">30 hari</span>
          </div>
          <div className="border-t border-border pt-3">
            <p className="text-xs text-muted-foreground">
              Receipt sudah dikirim ke email kamu. Mulai gunakan fitur premium sekarang!
            </p>
          </div>
        </CardContent>
      </Card>

      {/* CTA */}
      <div className="space-y-3">
        <Button asChild size="lg" className="w-full bg-emerald-600 hover:bg-emerald-700">
          <Link href="/slip">Mulai Audit Slip Gaji</Link>
        </Button>
        <Button asChild variant="outline" className="w-full">
          <Link href="/dashboard">Lihat Dashboard</Link>
        </Button>
      </div>

      {/* Support */}
      <p className="text-xs text-muted-foreground">
        Ada masalah?{" "}
        <a href="mailto:hi@cekwajar.id" className="text-primary hover:underline">
          Hubungi kami
        </a>
      </p>
    </div>
  );
}
