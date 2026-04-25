import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface PageHeaderProps {
  icon?: LucideIcon;
  badge?: string;
  title: string;
  description?: string;
  className?: string;
}

export function PageHeader({
  icon: Icon,
  badge,
  title,
  description,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn("mb-8", className)}>
      {badge && Icon && (
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-3 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400">
          <Icon className="w-3.5 h-3.5" />
          {badge}
        </div>
      )}
      {!badge && Icon && (
        <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center mb-3">
          <Icon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
        </div>
      )}
      <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
        {title}
      </h1>
      {description && (
        <p className="text-muted-foreground mt-2 text-sm sm:text-base leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
}
