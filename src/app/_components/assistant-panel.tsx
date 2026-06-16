"use client";

import { useMemo, useState } from "react";

import { api } from "@/trpc/react";

const promptExamples = [
  "Send an email to alex@example.com saying I will join the meeting at 3 PM.",
  "Create a calendar event tomorrow from 2 PM to 3 PM called Design review.",
  "Email priya@example.com a short follow-up about the project status.",
];

export function AssistantPanel() {
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState("");

  const runPrompt = api.assistant.runPrompt.useMutation({
    onSuccess: (data) => {
      setResult(data.output);
    },
    onError: (error) => {
      setResult(error.message);
    },
  });

  const canSubmit = useMemo(() => prompt.trim().length > 0, [prompt]);

  return (
    <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-white">AI Assistant</h2>
            <p className="text-sm text-white/55">
              Send mail or create calendar events from a single prompt.
            </p>
          </div>

          <button
            type="button"
            onClick={() => runPrompt.reset()}
            className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/70 transition hover:bg-white/10 hover:text-white"
          >
            Clear
          </button>
        </div>

        <label className="mb-2 block text-xs font-semibold tracking-wide text-white/45 uppercase">
          Prompt
        </label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ask for an email or a calendar event..."
          rows={6}
          className="w-full resize-none rounded-lg border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white transition outline-none placeholder:text-white/30 focus:border-indigo-400/60"
        />

        <div className="mt-3 flex flex-wrap gap-2">
          {promptExamples.map((example) => (
            <button
              key={example}
              type="button"
              onClick={() => setPrompt(example)}
              className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/70 transition hover:bg-white/10 hover:text-white"
            >
              {example}
            </button>
          ))}
        </div>

        <div className="mt-4 flex items-center gap-3">
          <button
            type="button"
            disabled={!canSubmit || runPrompt.isPending}
            onClick={() => runPrompt.mutate({ prompt })}
            className="inline-flex items-center gap-2 rounded-md bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {runPrompt.isPending ? "Working..." : "Run prompt"}
          </button>

          <span className="text-xs text-white/45">
            {runPrompt.isPending
              ? "Executing with Gmail and Calendar access"
              : "Ready"}
          </span>
        </div>

        <div className="mt-4 rounded-lg border border-white/10 bg-slate-950/70 p-4">
          <div className="mb-2 text-xs font-semibold tracking-wide text-white/45 uppercase">
            Result
          </div>
          <div className="min-h-24 text-sm leading-6 whitespace-pre-wrap text-white/85">
            {result || "No action yet."}
          </div>
        </div>
      </div>

      <aside className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
        <h3 className="text-sm font-semibold text-white">Connected tools</h3>
        <div className="mt-3 space-y-3 text-sm text-white/70">
          <div className="flex items-center justify-between rounded-lg border border-white/10 bg-slate-950/50 px-3 py-2">
            <span>Gmail</span>
            <span className="text-emerald-400">Ready</span>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-white/10 bg-slate-950/50 px-3 py-2">
            <span>Google Calendar</span>
            <span className="text-emerald-400">Ready</span>
          </div>
        </div>

        <div className="mt-4 rounded-lg border border-white/10 bg-slate-950/50 p-3 text-sm text-white/60">
          Use explicit recipient, subject, and time when the prompt is
          ambiguous.
        </div>
      </aside>
    </section>
  );
}
