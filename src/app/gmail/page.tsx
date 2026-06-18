import "./gmail.css";
import GmailDashboard from "@/app/_components/gmail-dashboard";
import { HydrateClient } from "@/trpc/server";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Neurosync Dashboard",
  description: "Test your Gmail webhooks and API integration powered by Neurosync",
};

export default function GmailPage() {
  return (
    <HydrateClient>
      <GmailDashboard />
    </HydrateClient>
  );
}
