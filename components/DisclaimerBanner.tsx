"use client";

import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

type DisclaimerType = "tax" | "property" | "salary" | "col" | "all";

const DISCLAIMERS: Record<DisclaimerType, string> = {
  tax: "Hasil ini untuk referensi saja dan bukan merupakan nasihat pajak. Untuk kepastian hukum, konsultasikan dengan konsultan pajak berlisensi (PKP).",
  property: "Data berdasarkan listing pasar, bukan penilaian properti resmi. Untuk transaksi properti, gunakan penilai berlisensi KJPP.",
  salary: "Data gaji bersumber dari data pemerintah dan kontribusi pengguna. Akurasi bervariasi. Ini bukan standar gaji yang ditetapkan secara hukum.",
  col: "Estimasi biaya hidup berdasarkan data statistik. Biaya aktual tergantung gaya hidup dan preferensi individu.",
  all: "Semua hasil cekwajar.id bersifat informasional dan edukatif saja, bukan nasihat profesional. Untuk kepastian hukum, konsultasikan dengan ahlinya.",
};

export function DisclaimerBanner({
  type = "all",
  className,
}: {
  type?: DisclaimerType;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mt-4 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg flex items-start gap-2",
        className
      )}
      role="note"
      aria-label="Disclaimer"
    >
      <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
      <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
        ⚠️ {DISCLAIMERS[type]}
      </p>
    </div>
  );
}
