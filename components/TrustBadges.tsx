import { ShieldCheck, Trash2, UserX, FileCheck, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

interface Badge {
  icon: React.ElementType;
  label: string;
  sublabel?: string;
}

const DEFAULT_BADGES: Badge[] = [
  {
    icon: Lock,
    label: "Enkripsi TLS 1.3",
    sublabel: "Data aman saat transfer",
  },
  {
    icon: Trash2,
    label: "Hapus Otomatis 30 Hari",
    sublabel: "Data tidak disimpan permanen",
  },
  {
    icon: UserX,
    label: "Tanpa Nama Tersimpan",
    sublabel: "Audit bisa tanpa daftar",
  },
  {
    icon: FileCheck,
    label: "Berbasis PMK 168/2023",
    sublabel: "Regulasi pajak resmi Indonesia",
  },
];

const PROPERTY_BADGES: Badge[] = [
  {
    icon: Lock,
    label: "Enkripsi TLS 1.3",
    sublabel: "Data aman saat transfer",
  },
  {
    icon: Trash2,
    label: "Hapus Otomatis",
    sublabel: "30 hari setelah audit",
  },
  {
    icon: FileCheck,
    label: "Data dari Listing Publik",
    sublabel: "99.co & Rumah123",
  },
  {
    icon: ShieldCheck,
    label: "IQR Statistical Method",
    sublabel: "Outlier otomatis dibuang",
  },
];

interface TrustBadgesProps {
  badges?: Badge[];
  className?: string;
  variant?: "default" | "property" | "compact";
}

export function TrustBadges({
  badges,
  className,
  variant = "default",
}: TrustBadgesProps) {
  const activeBadges = badges ?? (variant === "property" ? PROPERTY_BADGES : DEFAULT_BADGES);

  if (variant === "compact") {
    return (
      <div className={cn("flex flex-wrap gap-2 justify-center", className)}>
        {activeBadges.map((badge) => {
          const Icon = badge.icon;
          return (
            <div
              key={badge.label}
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/60 rounded-full px-3 py-1"
            >
              <Icon className="w-3 h-3 text-emerald-500" />
              <span>{badge.label}</span>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className={cn("grid grid-cols-2 md:grid-cols-4 gap-3 mb-6", className)}>
      {activeBadges.map((badge) => {
        const Icon = badge.icon;
        return (
          <div
            key={badge.label}
            className="flex flex-col items-center text-center p-3 bg-emerald-50 dark:bg-emerald-950/20 rounded-xl border border-emerald-100 dark:border-emerald-900"
          >
            <Icon className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mb-1.5" />
            <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
              {badge.label}
            </p>
            {badge.sublabel && (
              <p className="text-xs text-emerald-700/70 dark:text-emerald-400/70 mt-0.5 leading-tight">
                {badge.sublabel}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
