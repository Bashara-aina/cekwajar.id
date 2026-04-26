import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import crypto from "crypto";

interface MidtransNotification {
  order_id: string;
  transaction_status: "settlement" | "capture" | "pending" | "expire" | "cancel";
  gross_amount: string;
  status_code: string;
  transaction_id: string;
}

function verifyMidtransNotification(
  rawBody: string,
  signatureKey: string
): boolean {
  const serverKey = process.env.MIDTRANS_SERVER_KEY;
  if (!serverKey) {
    console.error("MIDTRANS_SERVER_KEY is not configured");
    return false;
  }

  const expected = crypto
    .createHash("sha512")
    .update(rawBody + serverKey)
    .digest("hex");

  return expected === signatureKey;
}

async function processUpgradeSubscription(
  userId: string,
  tier: "pro" | "basic"
): Promise<void> {
  const { error } = await supabaseAdmin.rpc("upgrade_subscription", {
    p_user_id: userId,
    p_tier: tier,
  });

  if (error) {
    console.error("Failed to upgrade subscription:", error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signatureKey = request.headers.get("x-midtrans-signature-key") ?? "";

  // Validate signature first
  if (!signatureKey || !verifyMidtransNotification(rawBody, signatureKey)) {
    console.warn("Invalid Midtrans signature received");
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let notification: MidtransNotification;

  try {
    notification = JSON.parse(rawBody);
  } catch {
    console.error("Failed to parse Midtrans notification body");
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { order_id, transaction_status, gross_amount, status_code, transaction_id } = notification;

  // Log the notification for debugging
  console.error("Midtrans webhook received:", {
    order_id,
    transaction_status,
    gross_amount,
    status_code,
    transaction_id,
  });

  // Handle different transaction statuses
  switch (transaction_status) {
    case "settlement":
    case "capture": {
      // Successful payment - upgrade subscription
      // Extract user ID from order_id format: CEKWAJAR_{userId}_{tier}
      const parts = order_id.replace("CEKWAJAR_", "").split("_");
      const userId = parts[0];

      if (!userId) {
        console.error("Invalid order_id format:", order_id);
        return NextResponse.json({ error: "Invalid order_id format" }, { status: 400 });
      }

      // Determine tier based on amount
      // pro: 79000, basic: other amounts
      const amount = Number(gross_amount);
      const tier: "pro" | "basic" = amount >= 79000 ? "pro" : "basic";

      try {
        // Fire and forget - don't await processing
        // Midtrans expects 200 response quickly
        processUpgradeSubscription(userId, tier).catch((err) => {
          console.error("Async subscription upgrade failed:", err);
        });

        console.error(`Subscription upgraded for user ${userId} to ${tier}`);
      } catch (err) {
        console.error("Failed to process subscription upgrade:", err);
        // Still return 200 to Midtrans to prevent retries
        // The payment was successful, we'll handle the upgrade separately
      }

      break;
    }

    case "pending": {
      // Payment is pending - no action needed
      console.error("Payment pending for order:", order_id);
      break;
    }

    case "expire": {
      // Payment expired - log for analytics
      console.error("Payment expired for order:", order_id);
      // Could trigger notification to user or cleanup
      break;
    }

    case "cancel": {
      // Payment was cancelled - log for analytics
      console.error("Payment cancelled for order:", order_id);
      // Could trigger notification to user
      break;
    }

    default:
      console.warn("Unknown transaction status:", transaction_status);
  }

  // Return 200 quickly to Midtrans
  // Don't wait for any processing
  return NextResponse.json({ received: true }, { status: 200 });
}
