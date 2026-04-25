"use client";

import { cn } from "@/lib/utils";

interface FormProgressProps {
  currentStep: number;
  totalSteps: number;
  labels?: string[];
  className?: string;
}

export function FormProgress({
  currentStep,
  totalSteps,
  labels,
  className,
}: FormProgressProps) {
  const percentage = Math.round((currentStep / totalSteps) * 100);

  return (
    <div className={cn("space-y-2", className)} aria-label="Progress">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          Step {currentStep} of {totalSteps}
          {labels && labels[currentStep - 1] && (
            <span className="ml-1 font-medium text-foreground">
              — {labels[currentStep - 1]}
            </span>
          )}
        </span>
        <span>{percentage}%</span>
      </div>
      <div
        className="h-1.5 bg-muted rounded-full overflow-hidden"
        role="progressbar"
        aria-valuenow={currentStep}
        aria-valuemin={0}
        aria-valuemax={totalSteps}
        aria-label={`${percentage}% complete`}
      >
        <div
          className="h-full bg-primary transition-all duration-500 ease-out rounded-full"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
