import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  icon: LucideIcon;
  title: string;
  description: string;
}

interface HowItWorksProps {
  steps: Step[];
  className?: string;
}

export function HowItWorks({ steps, className }: HowItWorksProps) {
  return (
    <div className={cn("grid grid-cols-1 sm:grid-cols-3 gap-6", className)}>
      {steps.map((step, index) => {
        const Icon = step.icon;
        return (
          <div key={index} className="relative">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center mb-4 relative">
                <Icon className="w-6 h-6 text-primary" />
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                  {index + 1}
                </span>
              </div>
              <h3 className="font-semibold text-sm text-foreground mb-2">
                {step.title}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {step.description}
              </p>
            </div>
            {index < steps.length - 1 && (
              <div className="hidden sm:block absolute top-6 left-[calc(50%+32px)] right-[calc(-50%+32px)] h-px bg-border" />
            )}
          </div>
        );
      })}
    </div>
  );
}
