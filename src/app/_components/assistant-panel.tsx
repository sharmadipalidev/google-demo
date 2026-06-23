"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { api } from "@/trpc/react";
import { Mic, Send, Bot, Sparkles, X, Edit2, ArrowRight, History, PlusSquare, Plus, ChevronDown } from "lucide-react";
import { useTheme } from "next-themes";
import { toast } from "sonner";

// Add TypeScript definitions for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface ChatSession {
  id: string;
  title: string;
  messages: { role: 'user' | 'assistant', content: string }[];
  updatedAt: number;
}

export function AssistantPanel({ userInitial = "U" }: { userInitial?: string }) {
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Load history from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("neurosync_chat_sessions");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSessions(parsed);
      } catch (e) {
        console.error("Failed to parse chat sessions", e);
      }
    }
  }, []);

  // Save history to localStorage whenever messages change
  useEffect(() => {
    if (messages.length === 0) return;

    setSessions(prev => {
      const isNewSession = !currentSessionId;
      const sessionId = currentSessionId || Date.now().toString();
      let newSessions;

      if (isNewSession) {
        setCurrentSessionId(sessionId);
        const title = messages[0].content.substring(0, 40) + (messages[0].content.length > 40 ? "..." : "");
        newSessions = [{ id: sessionId, title, messages, updatedAt: Date.now() }, ...prev];
      } else {
        newSessions = prev.map(s =>
          s.id === sessionId ? { ...s, messages, updatedAt: Date.now() } : s
        );
      }

      localStorage.setItem("neurosync_chat_sessions", JSON.stringify(newSessions));
      return newSessions;
    });
  }, [messages, currentSessionId]);

  const groupedSessions = useMemo(() => {
    const now = Date.now();
    const today: ChatSession[] = [];
    const yesterday: ChatSession[] = [];
    const previous: ChatSession[] = [];

    const sorted = [...sessions].sort((a, b) => b.updatedAt - a.updatedAt);

    for (const s of sorted) {
      const diffDays = (now - s.updatedAt) / (1000 * 60 * 60 * 24);
      if (diffDays < 1) today.push(s);
      else if (diffDays < 2) yesterday.push(s);
      else previous.push(s);
    }

    return { today, yesterday, previous };
  }, [sessions]);

  const runPrompt = api.assistant.runPrompt.useMutation({
    onSuccess: (data) => {
      setMessages(prev => [...prev, { role: "assistant", content: data.output }]);
    },
    onError: (error) => {
      setMessages(prev => [...prev, { role: "assistant", content: "Error: " + error.message }]);
    },
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, runPrompt.isPending]);

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
          if (event.error === 'no-speech') {
            setIsListening(false);
            return;
          }
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
      toast.error("Speech recognition is not supported in your browser. Please try Chrome or Edge.");
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

  const renderInputArea = () => (
    <div className="w-full mb-8">
      <div className="flex justify-end mb-2 max-w-3xl mx-auto">
        <span className="text-[11px] font-medium text-[#8e8e8e] dark:text-zinc-600 transition-colors">
          {prompt.length} / 500
        </span>
      </div>

      <form
        className="relative max-w-3xl mx-auto"
        onSubmit={(e) => {
          e.preventDefault();
          if (canSubmit && !runPrompt.isPending) {
            setMessages(prev => [...prev, { role: "user", content: prompt }]);
            runPrompt.mutate({ prompt, history: messages });
            setPrompt("");
          }
        }}
      >
        <div className={`relative flex items-center rounded-full border bg-transparent px-3 py-2 transition-all ${isListening ? 'border-[#1a1a1a] dark:border-white ring-1 ring-[#1a1a1a] dark:ring-white' : 'border-[#1a1a1a] dark:border-white focus-within:ring-1 focus-within:ring-[#1a1a1a] dark:focus-within:ring-white'}`}>
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value.slice(0, 500))}
            placeholder={isListening ? "Listening..." : "Type a command or ask a question..."}
            className="w-full bg-transparent px-4 py-2 text-sm text-[#1a1a1a] dark:text-white placeholder:text-[#5e5e5e] focus:outline-none"
            disabled={runPrompt.isPending}
            autoFocus
          />

          <div className="flex items-center gap-2 pr-1">
            <button
              type="button"
              onClick={toggleListening}
              className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${isListening ? 'bg-black/10 dark:bg-white/20 text-[#1a1a1a] dark:text-white animate-pulse' : 'text-[#8e8e8e] hover:text-[#1a1a1a] dark:hover:text-white'}`}
            >
              <Mic className="w-4 h-4" />
            </button>
            <button
              type="submit"
              disabled={!canSubmit || runPrompt.isPending}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1a1a1a] dark:bg-white text-white dark:text-[#1a1a1a] transition-all hover:bg-black dark:hover:bg-gray-200 disabled:opacity-50"
            >
              {runPrompt.isPending ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 dark:border-[#1a1a1a]/20 border-t-white dark:border-t-[#1a1a1a]" />
              ) : (
                <ArrowRight className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
      {/* ── Top Header Area ── */}
      <div style={{ position: 'sticky', top: 0, zIndex: 10, background: 'var(--bg-deep)', padding: '28px 32px 0 32px' }}>
        <div className="panel-header" style={{ marginBottom: '8px' }}>
          <h2 className="panel-title" style={{ margin: 0 }}>AI Assistant</h2>
          <div style={{ flex: 1 }} />

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsHistoryOpen(true)}
              className="flex items-center justify-center w-[38px] h-[38px] rounded-lg border border-black/10 dark:border-white/10 bg-transparent text-[#8e8e8e] hover:bg-black/5 dark:hover:bg-white/5 hover:text-[#1a1a1a] dark:hover:text-white transition-colors"
              title="Chat History"
            >
              <History className="w-[18px] h-[18px]" />
            </button>
            <button
              onClick={() => {
                setMessages([]);
                setCurrentSessionId(null);
                setIsHistoryOpen(false);
              }}
              className="flex items-center justify-center w-[38px] h-[38px] rounded-lg border border-black/10 dark:border-white/10 bg-transparent text-[#8e8e8e] hover:bg-black/5 dark:hover:bg-white/5 hover:text-[#1a1a1a] dark:hover:text-white transition-colors"
              title="New Chat"
            >
              <PlusSquare className="w-[18px] h-[18px]" />
            </button>
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="flex items-center justify-center w-[38px] h-[38px] rounded-lg border border-black/10 dark:border-white/10 bg-transparent text-[#8e8e8e] hover:bg-black/5 dark:hover:bg-white/5 hover:text-[#1a1a1a] dark:hover:text-white transition-colors"
              title="Toggle Theme"
            >
              {mounted && theme === 'dark' ? (
                <svg viewBox="0 0 24 24" fill="none" width="18" height="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" /></svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" width="18" height="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
              )}
            </button>
          </div>
        </div>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '24px' }}>
          Ask neurosync to summarize threads, schedule meetings, draft replies, or organize your inbox securely.
        </p>
      </div>

      {/* ── Center Content Area ── */}
      <div className={`overflow-y-auto ${messages.length > 0 ? 'flex-1' : 'flex-1 flex flex-col items-center justify-center'}`} style={{ padding: '0 32px 32px 32px' }}>
        {messages.length > 0 ? (
          <div className="flex flex-col h-full gap-6 pb-4 max-w-3xl mx-auto w-full">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-4 pt-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${msg.role === 'assistant' ? 'bg-white dark:bg-zinc-900 border border-black/10 dark:border-white/10 shadow-sm text-[#1a1a1a] dark:text-white' : 'bg-gray-100 dark:bg-zinc-800/50 text-[#1a1a1a] dark:text-white'}`}>
                  {msg.role === 'assistant' ? <img src="/logo.svg" alt="Agent" className="w-5 h-5 dark:invert" /> : <div className="text-sm font-semibold">{userInitial}</div>}
                </div>
                <div className="flex flex-col group max-w-[85%]">
                  <div className={`mt-1 rounded-2xl border border-black/5 dark:border-white/5 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm p-4 text-sm leading-relaxed whitespace-pre-wrap text-[#1a1a1a] dark:text-zinc-300 shadow-sm transition-colors ${msg.role === 'user' ? 'rounded-tr-none' : 'rounded-tl-none'}`}>
                    {msg.content}
                  </div>
                  {msg.role === 'user' && (
                    <button
                      onClick={() => setPrompt(msg.content)}
                      className="text-[11px] text-[#8e8e8e] hover:text-[#1a1a1a] dark:hover:text-white mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity self-end flex items-center gap-1"
                    >
                      <Edit2 className="w-3 h-3" /> Edit / Reuse
                    </button>
                  )}
                </div>
              </div>
            ))}

            {runPrompt.isPending && (
              <div className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white dark:bg-zinc-900 border border-black/10 dark:border-white/10 shadow-sm text-[#1a1a1a] dark:text-white transition-colors">
                  <img src="/logo.svg" alt="Agent" className="w-5 h-5 dark:invert" />
                </div>
                <div className="mt-1 rounded-2xl rounded-tl-none border border-black/5 dark:border-white/5 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm p-5 flex items-center gap-2 h-[42px]">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#1a1a1a] dark:bg-white opacity-50 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-[#1a1a1a] dark:bg-white opacity-50 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-[#1a1a1a] dark:bg-white opacity-50 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        ) : (
          <div className="w-full max-w-3xl mx-auto text-center mt-[-40px]">
            <h2 className="text-[40px] font-normal text-[#1a1a1a] dark:text-white mb-8 transition-colors">
              Hi Dipali, let's get into it
            </h2>
            {renderInputArea()}
          </div>
        )}
      </div>

      {/* ── Bottom Input Area ── */}
      {messages.length > 0 && (
        <div style={{ padding: '0 32px 32px 32px' }}>
          {renderInputArea()}
        </div>
      )}

      {/* ── History Drawer ── */}
      {isHistoryOpen && (
        <div className="absolute inset-0 z-50 flex justify-end bg-black/50 dark:bg-black/70 backdrop-blur-sm transition-opacity">
          <div className="w-80 h-full bg-white dark:bg-[#121212] border-l border-black/10 dark:border-white/10 p-6 flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-medium text-[#1a1a1a] dark:text-white">Chat History</h3>
              <button onClick={() => setIsHistoryOpen(false)} className="text-[#8e8e8e] hover:text-[#1a1a1a] dark:hover:text-white p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-8">
              {groupedSessions.today.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-[#8e8e8e] uppercase tracking-wider mb-3">Today</div>
                  <div className="space-y-1">
                    {groupedSessions.today.map(s => (
                      <button
                        key={s.id}
                        onClick={() => {
                          setMessages(s.messages);
                          setCurrentSessionId(s.id);
                          setIsHistoryOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors truncate ${s.id === currentSessionId ? 'text-[#1a1a1a] dark:text-white bg-black/5 dark:bg-white/5 font-medium' : 'text-[#8e8e8e] hover:bg-black/5 dark:hover:bg-white/5 hover:text-[#1a1a1a] dark:hover:text-white'}`}
                      >
                        {s.title}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {groupedSessions.yesterday.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-[#8e8e8e] uppercase tracking-wider mb-3">Yesterday</div>
                  <div className="space-y-1">
                    {groupedSessions.yesterday.map(s => (
                      <button
                        key={s.id}
                        onClick={() => {
                          setMessages(s.messages);
                          setCurrentSessionId(s.id);
                          setIsHistoryOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors truncate ${s.id === currentSessionId ? 'text-[#1a1a1a] dark:text-white bg-black/5 dark:bg-white/5 font-medium' : 'text-[#8e8e8e] hover:bg-black/5 dark:hover:bg-white/5 hover:text-[#1a1a1a] dark:hover:text-white'}`}
                      >
                        {s.title}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {groupedSessions.previous.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-[#8e8e8e] uppercase tracking-wider mb-3">Previous 7 Days</div>
                  <div className="space-y-1">
                    {groupedSessions.previous.map(s => (
                      <button
                        key={s.id}
                        onClick={() => {
                          setMessages(s.messages);
                          setCurrentSessionId(s.id);
                          setIsHistoryOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors truncate ${s.id === currentSessionId ? 'text-[#1a1a1a] dark:text-white bg-black/5 dark:bg-white/5 font-medium' : 'text-[#8e8e8e] hover:bg-black/5 dark:hover:bg-white/5 hover:text-[#1a1a1a] dark:hover:text-white'}`}
                      >
                        {s.title}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {sessions.length === 0 && (
                <div className="text-sm text-[#8e8e8e] text-center mt-10">
                  No chat history yet
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
