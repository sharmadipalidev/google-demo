import { NextResponse } from "next/server";
import crypto from "crypto";
import { env } from "@/env";
import { auth } from "@/lib/auth";

import { cookies } from "next/headers";

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: req.headers });
  const isDemoMode = cookies().get("isDemoMode")?.value === "true";

  if (!session?.user && !isDemoMode) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();

  if (!env.RAZORPAY_KEY_SECRET) {
    return NextResponse.json({ error: "Payment gateway is not configured" }, { status: 503 });
  }

  const generatedSignature = crypto
    .createHmac("sha256", env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  const sigBuf = Buffer.from(razorpay_signature, "hex");
  const genBuf = Buffer.from(generatedSignature, "hex");

  const isValid = sigBuf.length === genBuf.length && crypto.timingSafeEqual(sigBuf, genBuf);

  if (!isValid) {
    return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
  }

  if (session?.user) {
    // Update user role to admin (for demonstration purposes in DIPALI workspace)
    const { db } = await import("@/server/db");
    const { user } = await import("@/server/db/schema");
    const { eq } = await import("drizzle-orm");

    await db.update(user).set({ role: "admin" }).where(eq(user.id, session.user.id));
  }

  return NextResponse.json({ success: true, message: "Payment verified successfully" });
}
