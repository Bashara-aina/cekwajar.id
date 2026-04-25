import Link from "next/link";
import { ArrowRight, FileText, Banknote, Plane, Scale, Landmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ToolId = "slip" | "gaji" | "tanah" | "kabur" | "hidup";

interface ToolConfig {
  id: ToolId;
  name: string;
  href: string;
  description: string;
  icon: typeof FileText;
  iconColor: string;
}

const TOOL_CONFIGS: Record<ToolId, ToolConfig> = {
  slip: {
    id: "slip",
    name: "Wajar Slip",
    href: "/slip",
    description: "Audit PPh21 & BPJS",
    icon: FileText,
    iconColor: "text-amber-500",
  },
  gaji: {
    id: "gaji",
    name: "Wajar Gaji",
    href: "/gaji",
    description: "Benchmark gaji pasar",
    icon: Banknote,
    iconColor: "text-blue-500",
  },
  tanah: {
    id: "tanah",
    name: "Wajar Tanah",
    href: "/tanah",
    description: "Cek harga properti",
    icon: Landmark,
    iconColor: "text-stone-500",
  },
  kabur: {
    id: "kabur",
    name: "Wajar Kabur",
    href: "/kabur",
    description: "Bandingkam PPP global",
    icon: Plane,
    iconColor: "text-indigo-500",
  },
  hidup: {
    id: "hidup",
    name: "Wajar Hidup",
    href: "/hidup",
    description: "Biaya hidup & daya beli",
    icon: Scale,
    iconColor: "text-teal-500",
  },
};

interface CrossToolSuggestionProps {
  fromTool: ToolId;
  subtitle?: string;
  className?: string;
}

const SUGGESTION_MAP: Record<ToolId, ToolId> = {
  slip: "gaji",
  gaji: "kabur",
  kabur: "hidup",
  hidup: "slip",
  tanah: "gaji",
};

export function CrossToolSuggestion({
  fromTool,
  subtitle,
  className,
}: CrossToolSuggestionProps) {
  const suggestedToolId = SUGGESTION_MAP[fromTool];
  const suggestedTool = TOOL_CONFIGS[suggestedToolId];
  const Icon = suggestedTool.icon;

  return (
    <div
      className={cn(
        "bg-muted/50 border border-border rounded-xl p-4",
        className
      )}
    >
      <p className="text-xs text-muted-foreground mb-2">
        {subtitle ?? "Selain ini, mungkin berguna:"}
      </p>
      <Button variant="outline" className="w-full justify-between" asChild>
        <Link href={suggestedTool.href}>
          <span className="flex items-center gap-2">
            <Icon className={cn("w-4 h-4", suggestedTool.iconColor)} />
            <span className="font-medium">{suggestedTool.name}</span>
            <span className="text-muted-foreground text-xs">
              {suggestedTool.description}
            </span>
          </span>
          <ArrowRight className="w-4 h-4 text-muted-foreground" />
        </Link>
      </Button>
    </div>
  );
}

export { TOOL_CONFIGS };
export type { ToolId, ToolConfig };
