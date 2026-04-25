"use client";

import { useEffect, useState } from "react";

async function fetchCounter(): Promise<number> {
  try {
    const res = await fetch("/api/audit-counter", { cache: "no-store" });
    if (!res.ok) return 0;
    const data = await res.json();
    return data.count ?? 0;
  } catch {
    return 0;
  }
}

export function AuditCounterBadge({ className }: { className?: string }) {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    fetchCounter().then(setCount);
  }, []);

  return (
    <span className={className}>
      {count !== null ? (
        <span aria-label={`${count.toLocaleString("id-ID")} audit dilakukan`}>
          {count.toLocaleString("id-ID")}
        </span>
      ) : (
        <span aria-hidden="true">—</span>
      )}
    </span>
  );
}
