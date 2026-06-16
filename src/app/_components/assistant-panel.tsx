"use client";

import { useMemo, useState } from "react";
import { api } from "@/trpc/react";

export function AssistantPanel() {
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState("");

  const runPrompt = api.assistant.runPrompt.useMutation({
    onSuccess: (data) => {
      setResult(data.output);
      setPrompt(""); // Clear input on success
    },
    onError: (error) => {
      setResult(error.message);
    },
  });

  const canSubmit = useMemo(() => prompt.trim().length > 0, [prompt]);

  return (
    <div className="flex h-full w-full flex-col bg-[#0f0f13] text-white">
      <div className="flex-1 overflow-y-auto p-8 space-y-4">
        {result ? (
          <div className="flex gap-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-400">
              🤖
            </div>
            <div className="mt-1 rounded-xl rounded-tl-none border border-white/10 bg-white/5 p-4 text-sm leading-relaxed whitespace-pre-wrap text-white/90">
              {result}
            </div>
          </div>
        ) : (
          <div className="flex h-full flex-col items-center justify-center text-center opacity-50">
            <div className="mb-4 text-5xl">✨</div>
            <h3 className="text-lg font-medium text-white">How can I help you today?</h3>
            <p className="mt-2 text-sm max-w-sm">
              I can send emails, schedule calendar events, and manage your tasks.
            </p>
          </div>
        )}
      </div>

      <div className="border-t border-white/5 bg-[#14141a] p-4">
        <form
          className="relative mx-auto flex max-w-3xl items-center"
          onSubmit={(e) => {
            e.preventDefault();
            if (canSubmit && !runPrompt.isPending) {
              setResult(""); // clear old result
              runPrompt.mutate({ prompt });
            }
          }}
        >
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ask AI to do something..."
            className="w-full rounded-full border border-white/10 bg-[#1a1a24] px-6 py-4 pr-24 text-sm text-white placeholder:text-white/30 focus:border-indigo-500/50 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all"
            disabled={runPrompt.isPending}
            autoFocus
          />
          <button
            type="submit"
            disabled={!canSubmit || runPrompt.isPending}
            className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center justify-center rounded-full bg-indigo-500 px-4 py-2 text-xs font-semibold text-white transition hover:bg-indigo-400 disabled:opacity-50"
          >
            {runPrompt.isPending ? (
              <span className="flex items-center gap-2">
                <div className="h-3 w-3 animate-spin rounded-full border-2 border-white/20 border-t-white" />
              </span>
            ) : (
              "Send"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
