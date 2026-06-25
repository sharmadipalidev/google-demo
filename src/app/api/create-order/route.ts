import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { env } from "@/env";
import { auth } from "@/lib/auth";

import { cookies } from "next/headers";

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: req.headers });
  const isDemoMode = cookies().get("isDemoMode")?.value === "true";

  if (!session?.user && !isDemoMode) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { amount, currency } = await req.json();

  if (!env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET) {
    return NextResponse.json({ error: "Payment gateway is not configured" }, { status: 503 });
  }

  try {
    const razorpay = new Razorpay({
      key_id: env.RAZORPAY_KEY_ID,
      key_secret: env.RAZORPAY_KEY_SECRET,
    });

    const order = await razorpay.orders.create({
      amount: amount || 19900,
      currency: currency || "INR",
      receipt: `receipt_${Date.now()}`,
    });

    return NextResponse.json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
