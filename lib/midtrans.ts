import MidtransClient from "midtrans-client";

const snap = new MidtransClient.Snap({
  clientKey: process.env.MIDTRANS_CLIENT_KEY!,
  serverKey: process.env.MIDTRANS_SERVER_KEY!,
});

export async function createSnapToken({
  userId,
  tier,
}: {
  userId: string;
  tier: "basic" | "pro";
}) {
  const price = tier === "pro" ? 79000 : 29000;

  const transaction = await snap.createTransaction({
    transaction_details: {
      order_id: `CEKWAJAR_${userId}_${Date.now()}`,
      gross_amount: price,
    },
    item_details: [
      { id: tier, price, quantity: 1, name: `cekwajar.id ${tier}` },
    ],
    customer_details: {
      callback_url: `${process.env.DOMAIN}/api/midtrans/webhook`,
    },
  });

  return transaction.token;
}
