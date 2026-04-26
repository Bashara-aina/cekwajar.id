import Link from "next/link";
import { cn } from "@/lib/utils";

interface WordmarkLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

const sizeMap = {
  sm: { text: "text-base", icon: 18, dot: "text-[10px]" },
  md: { text: "text-lg",   icon: 22, dot: "text-xs" },
  lg: { text: "text-2xl",  icon: 28, dot: "text-sm" },
};

/* Balance scale SVG — evokes fairness/justice, the brand's core value */
function BrandMark({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="shrink-0"
    >
      {/* Center pillar */}
      <line x1="12" y1="4" x2="12" y2="20" stroke="#059669" strokeWidth="1.75" strokeLinecap="round" />
      {/* Crossbeam */}
      <line x1="4" y1="8" x2="20" y2="8" stroke="#059669" strokeWidth="1.75" strokeLinecap="round" />
      {/* Left pan hanging line */}
      <line x1="6" y1="8" x2="6" y2="13" stroke="#059669" strokeWidth="1.5" strokeLinecap="round" />
      {/* Right pan hanging line */}
      <line x1="18" y1="8" x2="18" y2="13" stroke="#059669" strokeWidth="1.5" strokeLinecap="round" />
      {/* Left pan — curved bottom */}
      <path d="M2 13 Q6 17 10 13" stroke="#059669" strokeWidth="1.75" strokeLinecap="round" fill="none" />
      {/* Right pan */}
      <path d="M14 13 Q18 17 22 13" stroke="#059669" strokeWidth="1.75" strokeLinecap="round" fill="none" />
      {/* Base */}
      <line x1="9" y1="20" x2="15" y2="20" stroke="#059669" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

export function WordmarkLogo({ className, size = "md" }: WordmarkLogoProps) {
  const s = sizeMap[size];

  return (
    <Link
      href="/"
      className={cn(
        "group inline-flex items-center gap-2 hover:opacity-85 transition-opacity duration-150",
        className
      )}
      aria-label="cekwajar.id — halaman utama"
    >
      <BrandMark size={s.icon} />
      <span className={cn("tracking-tight leading-none", s.text)}>
        <span className="font-normal text-foreground">cek</span>
        <span className="font-extrabold text-emerald-600">wajar</span>
        <span className={cn("font-normal text-muted-foreground ml-px", s.dot)}>.id</span>
      </span>
    </Link>
  );
}
