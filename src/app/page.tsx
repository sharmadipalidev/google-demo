import Link from "next/link";
import { HydrateClient } from "@/trpc/server";

export default async function Home() {
  return (
    <HydrateClient>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#0a0a0f] to-[#111118] text-white py-10">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-8">
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem] text-center">
            Corsair <span className="text-[hsl(240,84%,67%)]">Gmail</span> Demo
          </h1>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-8 w-full max-w-4xl place-items-center">
            <Link
              className="flex w-full max-w-md flex-col gap-4 rounded-xl bg-white/5 border border-white/10 p-6 hover:bg-white/10 transition-all"
              href="/gmail"
            >
              <h3 className="text-2xl font-bold">📥 Gmail Tester →</h3>
              <div className="text-lg text-white/70">
                Test your Gmail webhook integration. Read emails, manage labels,
                compose messages, and monitor webhook status.
              </div>
            </Link>
            <Link
              className="flex w-full max-w-md flex-col gap-4 rounded-xl bg-white/5 border border-white/10 p-6 hover:bg-white/10 transition-all"
              href="https://docs.corsair.dev/plugins/gmail"
              target="_blank"
            >
              <h3 className="text-2xl font-bold">📚 Corsair Docs →</h3>
              <div className="text-lg text-white/70">
                Learn more about the Gmail plugin, API operations,
                webhooks, and database sync.
              </div>
            </Link>
          </div>
        </div>
      </main>
    </HydrateClient>
  );
}
