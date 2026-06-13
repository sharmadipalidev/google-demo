import "./gmail.css";
import GmailDashboard from "@/app/_components/gmail-dashboard";
import { HydrateClient } from "@/trpc/server";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gmail Webhook Tester — Corsair",
  description: "Test your Gmail webhooks and API integration powered by Corsair",
};

export default function GmailPage() {
  return (
    <HydrateClient>
      <GmailDashboard />
    </HydrateClient>
  );
}
