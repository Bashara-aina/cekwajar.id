import MidtransClient from "midtrans-client";
import { REVENUE_ANCHORS } from "@/lib/constants";

const snap = new MidtransClient.Snap({
  clientKey: process.env.MIDTRANS_CLIENT_KEY!,
  serverKey: process.env.MIDTRANS_SERVER_KEY!,
});

export async function createSnapToken({
  userId,
  tier,
  amount,
  billingPeriod = 'monthly',
}: {
  userId: string;
  tier: "basic" | "pro";
  amount?: number;
  billingPeriod?: 'monthly' | 'annual';
}) {
  const price = amount ?? (tier === "pro" ? REVENUE_ANCHORS.PRO_PRICE_IDR : 29000);
  const sku = tier === "pro"
    ? (billingPeriod === 'annual' ? 'cekwajar-pro-annual-449k-v1' : 'cekwajar-pro-monthly-49k-v1')
    : 'cekwajar-basic-monthly-29k-v1'

  const transaction = await snap.createTransaction({
    transaction_details: {
      order_id: `CEKWAJAR_${userId}_${billingPeriod}_${Date.now()}`,
      gross_amount: price,
    },
    item_details: [
      { id: sku, price, quantity: 1, name: `cekwajar.id ${tier === 'pro' ? 'Pro' : 'Basic'} ${billingPeriod === 'annual' ? '(Annual)' : ''}`.trim() },
    ],
    customer_details: {
      callback_url: `${process.env.DOMAIN}/api/midtrans/webhook`,
    },
  });

  return transaction.token;
}