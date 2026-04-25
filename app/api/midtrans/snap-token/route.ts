import { NextRequest, NextResponse } from "next/server";
import { createSnapToken } from "@/lib/midtrans";
import { checkRateLimit } from "@/lib/middleware/rateLimit";
import { logger } from "@/lib/logger";

export async function POST(request: NextRequest) {
  // Check rate limit
  const rateLimitResult = checkRateLimit(request);
  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later.", retryAfter: rateLimitResult.retryAfter },
      { status: 429, headers: { "Retry-After": String(rateLimitResult.retryAfter ?? 60) } }
    );
  }

  const startTime = Date.now();

  try {
    const { user_id, tier } = await request.json();

    if (!user_id || !tier) {
      return NextResponse.json(
        { error: "user_id and tier are required" },
        { status: 400 }
      );
    }

    if (!["basic", "pro"].includes(tier)) {
      return NextResponse.json({ error: "Invalid tier" }, { status: 400 });
    }

    const token = await createSnapToken({ userId: user_id, tier });

    const duration = Date.now() - startTime;
    logger("info", "Snap token created", { route: "/api/midtrans/snap-token", duration });

    return NextResponse.json({ token });
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    logger("error", "Snap token creation failed", { route: "/api/midtrans/snap-token", error: errorMessage, duration });
    return NextResponse.json(
      { error: "Failed to create payment token" },
      { status: 500 }
    );
  }
}
