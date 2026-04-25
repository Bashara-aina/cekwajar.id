import * as React from "react";
import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  shimmer?: boolean;
}

function Skeleton({ className, shimmer = true, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        shimmer ? "skeleton-shimmer" : "bg-muted rounded-md",
        className
      )}
      {...props}
    />
  );
}

export { Skeleton };