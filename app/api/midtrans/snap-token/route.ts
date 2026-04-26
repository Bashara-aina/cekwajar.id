import { NextRequest, NextResponse } from "next/server";
import { createSnapToken } from "@/lib/midtrans";
import { checkRateLimit } from "@/lib/middleware/rateLimit";
import { logger } from "@/lib/logger";
import { REVENUE_ANCHORS } from "@/lib/constants";

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  const rateLimitResult = checkRateLimit(request);
  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      { error: "Terlalu banyak permintaan. Coba lagi nanti.", retryAfter: rateLimitResult.retryAfter },
      { status: 429, headers: { "Retry-After": String(rateLimitResult.retryAfter ?? 60) } }
    );
  }

  const startTime = Date.now();

  try {
    const { user_id, tier, billingPeriod = 'monthly' } = await request.json();

    if (!user_id || !tier) {
      return NextResponse.json(
        { error: "user_id and tier are required" },
        { status: 400 }
      );
    }

    if (tier !== 'pro') {
      return NextResponse.json({ error: "Invalid tier" }, { status: 400 });
    }

    const amount = billingPeriod === 'annual'
      ? 449_000
      : REVENUE_ANCHORS.PRO_PRICE_IDR

    const token = await createSnapToken({
      userId: user_id,
      tier: 'pro',
      amount,
      billingPeriod,
    });

    const duration = Date.now() - startTime;
    logger("info", "Snap token created", { route: "/api/midtrans/snap-token", duration, tier, billingPeriod } as Record<string, unknown>);

    return NextResponse.json({ token });
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    logger("error", "Snap token creation failed", { route: "/api/midtrans/snap-token", error: errorMessage, duration });
    return NextResponse.json(
      { error: "Gagal membuat token pembayaran" },
      { status: 500 }
    );
  }
}