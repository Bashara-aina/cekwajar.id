"use client";

import { FirstVisitBanner } from "@/components/FirstVisitBanner";
import { usePathname } from "next/navigation";

const TOOL_PATHS = ["/slip", "/gaji", "/tanah", "/kabur", "/hidup"];

export function LayoutBanner() {
  const pathname = usePathname();
  const isToolPage = TOOL_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  if (!isToolPage) return null;

  return <FirstVisitBanner />;
}
