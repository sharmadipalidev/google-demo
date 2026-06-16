import Link from "next/link";

import { AssistantPanel } from "@/app/_components/assistant-panel";
import { HydrateClient } from "@/trpc/server";

export default function Home() {
  return (
    <HydrateClient>
      <main className="min-h-screen bg-slate-950 text-white">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
          <header className="flex flex-col gap-2 border-b border-white/10 pb-4">
            <div className="text-xs font-semibold tracking-[0.25em] text-indigo-300/70 uppercase">
              Corsair Demo
            </div>
            <div className="flex flex-wrap items-end justify-between gap-3">
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                AI Gmail and Calendar
              </h1>
              <div className="flex items-center gap-2 text-sm text-white/60">
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                  Prompt-driven
                </span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                  Gmail
                </span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                  Calendar
                </span>
              </div>
            </div>
          </header>

          <AssistantPanel />

          <section className="grid gap-3 border-t border-white/10 pt-4 sm:grid-cols-2">
            <Link
              href="/gmail"
              className="rounded-xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-indigo-400/40 hover:bg-white/[0.05]"
            >
              <div className="text-sm font-semibold text-white">
                Gmail dashboard
              </div>
              <div className="mt-1 text-sm text-white/55">
                Browse inbox, drafts, labels, and calendar controls.
              </div>
            </Link>

            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <div className="text-sm font-semibold text-white">
                Agent status
              </div>
              <div className="mt-1 text-sm text-white/55">
                The assistant uses your connected Corsair Gmail and Google
                Calendar accounts.
              </div>
            </div>
          </section>
        </div>
      </main>
    </HydrateClient>
  );
}
