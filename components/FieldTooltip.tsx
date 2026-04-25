import { useState } from "react";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface FieldTooltipProps {
  content: string;
  className?: string;
}

export function FieldTooltip({ content, className }: FieldTooltipProps) {
  const [open, setOpen] = useState(false);

  return (
    <span className={cn("relative inline-flex items-center", className)}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        onBlur={() => setOpen(false)}
        className="inline-flex items-center justify-center w-4 h-4 rounded-full text-muted-foreground hover:text-foreground transition-colors focus:outline-none"
        aria-label="Informasi"
        aria-expanded={open}
      >
        <Info className="w-3.5 h-3.5" />
      </button>
      {open && (
        <div className="absolute left-0 top-full mt-1 z-50 w-64 p-3 bg-popover border border-border rounded-lg shadow-lg">
          <p className="text-xs text-popover-foreground leading-relaxed">
            {content}
          </p>
        </div>
      )}
    </span>
  );
}

export const FIELD_TOOLTIPS = {
  npwp: "NPWP wajib dimiliki setiap wajib pajak di Indonesia. Tanpa NPWP, tarif PPh21 lebih tinggi 20%.",
  ptkp:
    "PTKP (Penghasilan Tidak Kena Pajak) adalah batas penghasilan yang bebas pajak. Status ini menentukan PTKP kamu: TK0 (tidak kawin), K0 (kawin), K1 (kawin + 1 tanggungan), K2 (kawin + 2 tanggungan), K3 (kawin + 3 tanggungan).",
  jp_karyawan:
    "JP (Jaminan Pensiun) BPJS Ketenagakerjaan. Iuran: 1% dari karyawan + 2% dari pemberi kerja. Ditargetkan untuk tabungan pensiun.",
  jht_karyawan:
    "JHT (Jaminan Hari Tua) BPJS Ketenagakerjaan. Iuran: 2% dari karyawan + 3.7% dari pemberi kerja. Bisa dicairkan untuk rumah, modal usaha, atau pensiun.",
  bpjs_kes:
    "BPJS Kesehatan. Iuran: 1% dari karyawan + 4% dari pemberi kerja. Untuk layanan kesehatan nasional.",
  pph21:
    "PPh21 adalah pajak penghasilan Pasal 21 yang dipotong langsung dari gaji kamu oleh pemberi kerja.",
  gapok: "Gaji pokok (gapok) adalah komponen tetap dari penghasilan brutto sebelum加上 tunjangan.",
  tunjangan: "Tunjangan adalah komponen tambahan dari penghasilan seperti tunjangan makan, transport, dll.",
  umk: "UMK (Upah Minimum Kota/Kabupaten) — juga dikenal sebagai UMR di beberapa daerah. Ini adalah batas minimum upah yang harus dibayar di kota/kamu.",
} as const;
