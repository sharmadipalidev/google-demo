"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { api } from "@/trpc/react";
import { Bot, Sparkles, Mic, MicOff, Send, User } from "lucide-react";

export function AssistantPanel() {
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState("");
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

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

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;

        recognitionRef.current.onresult = (event: any) => {
          let currentTranscript = "";
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            currentTranscript += event.results[i][0].transcript;
          }
          // Append to the existing prompt or just replace? 
          // Usually, replacing or managing state carefully is better, but since it's continuous, 
          // we might just want to set it to the finalized transcript.
          // For simplicity, we just set the prompt to whatever was heard.
          // Note: for a more robust approach, we'd handle interim vs final results.
          setPrompt(currentTranscript);
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error("Speech recognition error", event.error);
          setIsListening(false);
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      }
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      setPrompt(""); // Clear prompt when starting a new voice command
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  return (
    <div className="flex h-full w-full flex-col bg-white dark:bg-[#0a0a0a] text-[#0f1115] dark:text-zinc-100 transition-colors duration-300">
      {/* ── Top Header Area ── */}
      <div className="flex flex-col gap-2 p-8 border-b border-black/5 dark:border-white/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 rounded-full bg-black/5 dark:bg-white/10 px-3 py-1 text-xs font-medium text-[#1a1a1a] dark:text-zinc-200">
            <Bot size={14} className="text-brand-green" />
            Neurosync AI
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mt-2 gap-4">
          <div>
            <h1 className="text-2xl font-display font-bold tracking-tight text-[#1a1a1a] dark:text-white">What should Neurosync do?</h1>
            <p className="text-sm text-[#8e8e8e] dark:text-zinc-400 mt-1">Control email and calendar workflows with natural language.</p>
          </div>
          <div className="flex items-center gap-1 rounded-full bg-brand-green/20 dark:bg-brand-green/10 px-3 py-1 text-xs font-semibold text-brand-green border border-brand-green/20">
            OpenAI + Corsair tools
          </div>
        </div>
      </div>

      {/* ── Center Content Area ── */}
      <div className="flex-1 overflow-y-auto p-8">
        {result ? (
          <div className="flex gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1a1a1a] dark:bg-zinc-800 text-brand-green shadow-sm">
              <Sparkles size={20} />
            </div>
            <div className="mt-1 rounded-2xl rounded-tl-none border border-black/5 dark:border-white/5 bg-white/50 dark:bg-zinc-900 p-5 text-sm leading-relaxed whitespace-pre-wrap text-[#1a1a1a] dark:text-zinc-200 shadow-sm backdrop-blur-sm">
              {result}
            </div>
          </div>
        ) : (
          <div className="flex h-full flex-col items-center justify-center text-center max-w-2xl mx-auto">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#1a1a1a] dark:bg-zinc-800 text-brand-green shadow-lg">
              <Bot size={32} />
            </div>
            
            <h2 className="text-2xl font-bold text-[#1a1a1a] dark:text-white mb-2 font-display">Delegate the busywork.</h2>
            <p className="text-sm text-[#8e8e8e] dark:text-zinc-400 max-w-md mx-auto mb-8 leading-relaxed">
              Ask the agent to summarize, draft, schedule, triage, or execute routine communication tasks using your voice or text.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
              {suggestions.map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => setPrompt(suggestion)}
                  className="flex items-center justify-center rounded-xl border border-black/5 dark:border-white/10 bg-white/50 dark:bg-zinc-900/50 p-4 text-sm text-[#1a1a1a] dark:text-zinc-300 transition-all hover:border-black/10 dark:hover:border-white/20 hover:bg-white dark:hover:bg-zinc-800 shadow-sm"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Bottom Input Area ── */}
      <div className="p-8 pt-4 border-t border-black/5 dark:border-white/5 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md">
        <div className="flex justify-end mb-2">
          <span className="text-[11px] font-medium text-[#8e8e8e] dark:text-zinc-500">
            {prompt.length} / 500
          </span>
        </div>
        
        <form
          className="relative"
          onSubmit={(e) => {
            e.preventDefault();
            if (isListening) {
              toggleListening(); // stop listening if user submits manually
            }
            if (canSubmit && !runPrompt.isPending) {
              setResult(""); // clear old result
              runPrompt.mutate({ prompt });
            }
          }}
        >
          <div className="relative flex items-center rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-900 px-2 py-2 shadow-sm transition-all focus-within:border-brand-green dark:focus-within:border-brand-green focus-within:ring-1 focus-within:ring-brand-green">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value.slice(0, 500))}
              placeholder={isListening ? "Listening..." : "Tell the agent what outcome you want..."}
              className="w-full bg-transparent px-4 py-3 text-sm text-[#1a1a1a] dark:text-white placeholder:text-[#8e8e8e] dark:placeholder:text-zinc-500 focus:outline-none"
              disabled={runPrompt.isPending}
              autoFocus
            />
            
            <div className="flex items-center gap-2 pr-2">
              {/* Microphone Button */}
              <button
                type="button"
                onClick={toggleListening}
                className={`flex h-10 w-10 items-center justify-center rounded-full transition-all ${
                  isListening 
                    ? "bg-red-500/10 text-red-500 hover:bg-red-500/20 animate-pulse" 
                    : "text-[#8e8e8e] dark:text-zinc-400 hover:text-[#1a1a1a] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10"
                }`}
                title={isListening ? "Stop listening" : "Start voice command"}
              >
                {isListening ? <MicOff size={20} /> : <Mic size={20} />}
              </button>

              {/* Send Button */}
              <button
                type="submit"
                disabled={!canSubmit || runPrompt.isPending}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1a1a1a] dark:bg-white text-white dark:text-[#1a1a1a] transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed shadow-md"
              >
                {runPrompt.isPending ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : (
                  <Send size={18} className="-ml-0.5" />
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
