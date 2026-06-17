"use client";

import { useMemo, useState } from "react";
import { api } from "@/trpc/react";

export function AssistantPanel() {
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState("");

  const runPrompt = api.assistant.runPrompt.useMutation({
    onSuccess: (data) => {
      setResult(data.output);
      setPrompt("");
    },
    onError: (error) => {
      setResult(error.message);
    },
  });

  const canSubmit = useMemo(() => prompt.trim().length > 0, [prompt]);

  const suggestions = [
    "Summarize my urgent emails",
    "Draft follow-ups from yesterday",
    "Find time for a 30 minute sync",
    "Archive low-signal newsletters"
  ];

  return (
    <div className="flex h-full w-full flex-col bg-white text-[#0f1115]">
      {/* ── Top Header Area ── */}
      <div className="flex flex-col gap-2 p-8 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83"></path>
            </svg>
            AI operator
          </div>
        </div>
        
        <div className="flex items-end justify-between mt-2">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">What should ZERO INBOX do?</h1>
            <p className="text-sm text-gray-500 mt-1">Control email and calendar workflows with natural language.</p>
          </div>
          <div className="flex items-center gap-1 rounded-full bg-indigo-50/50 px-3 py-1 text-xs font-semibold text-indigo-600">
            OpenAI + Corsair tools
          </div>
        </div>
      </div>

      {/* ── Center Content Area ── */}
      <div className="flex-1 overflow-y-auto p-8">
        {result ? (
          <div className="flex gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0f1115] text-white">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="10" rx="2" ry="2"></rect>
                <circle cx="12" cy="5" r="2"></circle>
                <path d="M12 7v4"></path>
                <line x1="8" y1="16" x2="8" y2="16"></line>
                <line x1="16" y1="16" x2="16" y2="16"></line>
              </svg>
            </div>
            <div className="mt-1 rounded-2xl rounded-tl-none border border-gray-100 bg-gray-50 p-5 text-sm leading-relaxed whitespace-pre-wrap text-gray-800">
              {result}
            </div>
          </div>
        ) : (
          <div className="flex h-full flex-col items-center justify-center text-center max-w-2xl mx-auto">
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0f1115] text-white shadow-sm">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="10" rx="2" ry="2"></rect>
                <circle cx="12" cy="5" r="2"></circle>
                <path d="M12 7v4"></path>
                <line x1="8" y1="16" x2="8" y2="16"></line>
                <line x1="16" y1="16" x2="16" y2="16"></line>
              </svg>
            </div>
            
            <h2 className="text-xl font-bold text-gray-900 mb-2">Delegate the busywork.</h2>
            <p className="text-sm text-gray-500 max-w-md mx-auto mb-8 leading-relaxed">
              Ask the agent to summarize, draft, schedule, triage, or execute routine communication tasks.
            </p>

            <div className="grid grid-cols-2 gap-3 w-full">
              {suggestions.map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => setPrompt(suggestion)}
                  className="flex items-center justify-center rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-600 transition hover:border-gray-300 hover:bg-gray-50 hover:text-gray-900"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Bottom Input Area ── */}
      <div className="p-8 pt-4">
        <div className="flex justify-end mb-2">
          <span className="text-[11px] font-medium text-gray-400">
            {prompt.length} / 500
          </span>
        </div>
        
        <form
          className="relative"
          onSubmit={(e) => {
            e.preventDefault();
            if (canSubmit && !runPrompt.isPending) {
              setResult(""); // clear old result
              runPrompt.mutate({ prompt });
            }
          }}
        >
          <div className="relative flex items-center rounded-2xl border border-gray-200 bg-white px-2 py-2 shadow-sm transition-all focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value.slice(0, 500))}
              placeholder="Tell the agent what outcome you want..."
              className="w-full bg-transparent px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none"
              disabled={runPrompt.isPending}
              autoFocus
            />
            
            <div className="flex items-center gap-1 pr-2">
              <button
                type="button"
                className="flex h-9 w-9 items-center justify-center rounded-full text-gray-400 hover:text-gray-600 transition"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83"></path>
                </svg>
              </button>
              <button
                type="submit"
                disabled={!canSubmit || runPrompt.isPending}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-900 text-white transition hover:bg-gray-800 disabled:opacity-50 disabled:bg-gray-200 disabled:text-gray-400"
              >
                {runPrompt.isPending ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="22" y1="2" x2="11" y2="13"></line>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                  </svg>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
