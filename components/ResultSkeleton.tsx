"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ResultSkeleton() {
  return (
    <div className="space-y-4" role="status" aria-label="Memuat hasil">
      {/* Verdict card skeleton */}
      <Card>
        <CardContent className="pt-4 space-y-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-3 w-48" />
        </CardContent>
      </Card>

      {/* Summary banner skeleton */}
      <Card className="border-2 border-red-200 dark:border-red-800">
        <CardContent className="pt-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detail cards skeleton */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-4 space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-7 w-36" />
            <Skeleton className="h-3 w-20" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-7 w-32" />
            <Skeleton className="h-3 w-16" />
          </CardContent>
        </Card>
      </div>

      {/* Violations skeleton */}
      <Card>
        <CardContent className="pt-4 space-y-2">
          <Skeleton className="h-4 w-36" />
          {[1, 2].map((i) => (
            <div key={i} className="space-y-1.5 rounded-lg bg-white border p-2">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-3/4" />
            </div>
          ))}
        </CardContent>
      </Card>

      <span className="sr-only">Memuat hasil analisis...</span>
    </div>
  );
}
