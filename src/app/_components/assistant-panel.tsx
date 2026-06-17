"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { api } from "@/trpc/react";
import { Mic, Send, Bot, Sparkles, X } from "lucide-react";
import { useTheme } from "next-themes";

// Add TypeScript definitions for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export function AssistantPanel() {
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState("");
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const { theme, setTheme } = useTheme();

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
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        
        recognition.onresult = (event: any) => {
          let currentTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            currentTranscript += event.results[i][0].transcript;
          }
          setPrompt(currentTranscript);
        };

        recognition.onerror = (event: any) => {
          console.error("Speech recognition error", event.error);
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in your browser. Please try Chrome or Edge.");
      return;
    }
    
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setPrompt("");
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
      {/* ── Top Header Area ── */}
      <div style={{ padding: '28px 32px 24px 32px' }}>
        <div className="panel-header" style={{ marginBottom: 0 }}>
          <h2 className="panel-title">AI Assistant</h2>
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="btn-refresh"
            title="Toggle Theme"
          >
            {theme === 'dark' ? (
              <svg viewBox="0 0 24 24" fill="none" width="18" height="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" width="18" height="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            )}
          </button>
        </div>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '8px' }}>
          Control your workspace workflows with natural language.
        </p>
      </div>

      {/* ── Center Content Area ── */}
      <div className="flex-1 overflow-y-auto" style={{ padding: '0 32px 32px 32px' }}>
        {result ? (
          <div className="flex flex-col h-full">
            <div className="flex justify-end mb-4">
               <button 
                 onClick={() => setResult("")}
                 className="flex items-center gap-1 text-xs text-[#8e8e8e] hover:text-[#1a1a1a] dark:hover:text-white transition-colors"
               >
                 <X className="w-3 h-3" /> Clear Output
               </button>
            </div>
            <div className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1a1a1a] dark:bg-zinc-800 text-brand-green dark:text-white transition-colors">
                <Bot className="w-5 h-5" />
              </div>
              <div className="mt-1 rounded-2xl rounded-tl-none border border-black/5 dark:border-white/5 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm p-5 text-sm leading-relaxed whitespace-pre-wrap text-[#1a1a1a] dark:text-zinc-300 shadow-sm transition-colors">
                {result}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex h-full flex-col items-center justify-center text-center max-w-2xl mx-auto">
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1a1a1a] dark:bg-zinc-800 text-brand-green dark:text-white shadow-sm transition-colors">
              <Bot className="w-7 h-7" />
            </div>
            
            <h2 className="text-xl font-bold text-[#1a1a1a] dark:text-white mb-2 transition-colors">Your personal AI operator.</h2>
            <p className="text-sm text-[#8e8e8e] dark:text-zinc-500 max-w-md mx-auto mb-8 leading-relaxed transition-colors">
              Ask neurosync to summarize threads, schedule meetings, draft replies, or organize your inbox securely.
            </p>

            <div className="grid grid-cols-2 gap-3 w-full">
              {suggestions.map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => setPrompt(suggestion)}
                  className="flex items-center justify-center text-center rounded-xl border border-black/5 dark:border-white/5 bg-white dark:bg-zinc-900 p-4 text-sm text-[#8e8e8e] dark:text-zinc-400 transition-colors hover:border-black/20 dark:hover:border-white hover:text-[#1a1a1a] dark:hover:text-white shadow-sm"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Bottom Input Area ── */}
      <div style={{ padding: '24px 32px', borderTop: '1px solid var(--border)', background: 'var(--bg-deep)' }}>
        <div className="flex justify-end mb-2">
          <span className="text-[11px] font-medium text-[#8e8e8e] dark:text-zinc-600 transition-colors">
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
          <div className={`relative flex items-center rounded-2xl border bg-white dark:bg-zinc-900 px-2 py-2 shadow-sm transition-all ${isListening ? 'border-black/20 ring-1 ring-black/20 dark:border-white dark:ring-white' : 'border-black/5 dark:border-white/5 focus-within:border-black/20 dark:focus-within:border-white focus-within:ring-1 focus-within:ring-black/20 dark:focus-within:ring-white'}`}>
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value.slice(0, 500))}
              placeholder={isListening ? "Listening..." : "Tell the agent what outcome you want..."}
              className="w-full bg-transparent px-4 py-3 text-sm text-[#1a1a1a] dark:text-white placeholder:text-[#8e8e8e] dark:placeholder:text-zinc-600 focus:outline-none transition-colors"
              disabled={runPrompt.isPending}
              autoFocus
            />
            
            <div className="flex items-center gap-1 pr-2">
              <button
                type="button"
                onClick={toggleListening}
                className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors ${isListening ? 'bg-black/10 dark:bg-white/20 text-[#1a1a1a] dark:text-white animate-pulse' : 'text-[#8e8e8e] dark:text-zinc-500 hover:text-[#1a1a1a] dark:hover:text-white'}`}
              >
                <Mic className="w-4 h-4" />
              </button>
              <button
                type="submit"
                disabled={!canSubmit || runPrompt.isPending}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1a1a1a] dark:bg-white text-white dark:text-[#1a1a1a] transition-all hover:scale-105 disabled:opacity-50 disabled:scale-100 disabled:bg-gray-200 dark:disabled:bg-zinc-800 disabled:text-gray-400"
              >
                {runPrompt.isPending ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 dark:border-black/20 border-t-white dark:border-t-black" />
                ) : (
                  <Send className="w-4 h-4 ml-0.5" />
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
