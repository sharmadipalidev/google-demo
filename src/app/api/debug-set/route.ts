import { corsair } from "@/server/corsair";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const cid = process.env.GOOGLE_CLIENT_ID!;
    const csec = process.env.GOOGLE_CLIENT_SECRET!;
    await corsair.keys.gmail.set_client_id(cid);
    await corsair.keys.gmail.set_client_secret(csec);
    await corsair.keys.googlecalendar.set_client_id(cid);
    await corsair.keys.googlecalendar.set_client_secret(csec);
    return NextResponse.json({ success: true, message: "Credentials set successfully via Next.js" });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message, stack: e.stack });
  }
}
