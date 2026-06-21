"use client";

import { useState } from "react";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import { Mic, Send, Bot, X, Edit2 } from "lucide-react";

const DUMMY_MESSAGES = [
  {
    id: "1",
    from: "Google",
    subject: "You shared some Google Account data with Clerk",
    snippet: "Keep track of your Google Account data sharmadipali2000@gmail.com You're receiving this email because you used Sign in with Google to sign in to Clerk on June 18 at 1:58 P...",
    date: "Jun 18, 2:02 PM",
    color: "#f59e0b",
    initial: "G"
  },
  {
    id: "2",
    from: "Vercel",
    subject: "Failed production deployment on team 'Dipali Sharma's projects'",
    snippet: "Hello, sharmadipali2000-4434. There was an error deploying google-demo to the production environment. See deployment details If you'd like to report an issue, reach out to ...",
    date: "Jun 18, 1:58 PM",
    color: "#f97316",
    initial: "V"
  },
  {
    id: "3",
    from: "Vercel",
    subject: "Failed production deployment on team 'Dipali Sharma's projects'",
    snippet: "Hello, sharmadipali2000-4434. There was an error deploying google-demo to the production environment. See deployment details If you'd like to report an issue, reach out to ...",
    date: "Jun 18, 1:39 PM",
    color: "#f97316",
    initial: "V"
  },
  {
    id: "4",
    from: "LinkedIn Job Recommendations",
    subject: "Termgrid is hiring a Frontend Developer - Remote",
    snippet: "Discover roles that match your interests",
    date: "Jun 18, 1:36 PM",
    color: "#f59e0b",
    initial: "L"
  },
  {
    id: "5",
    from: "Vercel",
    subject: "Failed production deployments on team 'Dipali Sharma's projects'",
    snippet: "Hello, sharmadipali2000-4434. There was an error deploying google-demo to the production environment. See deployment details If you'd like to report an issue, reach out to ...",
    date: "Jun 18, 1:33 PM",
    color: "#f97316",
    initial: "V"
  },
  {
    id: "6",
    from: "Udemy",
    subject: "AI is getting smarter. It's also getting better at being wrong",
    snippet: "AI hallucinations, a free productivity guide, and lessons from McLaren Racing, inside",
    date: "Jun 18, 12:17 PM",
    color: "#10b981",
    initial: "U"
  },
  {
    id: "7",
    from: "LinkedIn Job Alerts",
    subject: "Front-End Developer Intern (JavaScript, React)) at Skillfied Mentor Jobs",
    snippet: "Dipali, apply today",
    date: "Jun 18, 9:37 AM",
    color: "#06b6d4",
    initial: "L"
  },
  {
    id: "8",
    from: "Vercel",
    subject: "Failed production deployment on team 'Dipali Sharma's projects'",
    snippet: "Hello, sharmadipali2000-4434. There was an error deploying google-demo to the production environment. See deployment details If you'd like to report an issue, reach out to ...",
    date: "Jun 18, 4:36 AM",
    color: "#f97316",
    initial: "V"
  }
];

export default function DummyDashboard() {
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState("inbox");
  const [inboxCategory, setInboxCategory] = useState("primary");
  const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null);

  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<{role: 'user'|'assistant', content: string}[]>([]);

  const primaryTabs = [
    { key: "inbox", label: "Inbox", badge: "28", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg> },
    { key: "starred", label: "Starred", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg> },
    { key: "sent", label: "Sent", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg> },
    { key: "drafts", label: "Drafts", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg> },
    { key: "spam", label: "Spam", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg> },
    { key: "trash", label: "Trash", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg> },
  ];

  const secondaryTabs = [
    { key: "calendar", label: "Calendar", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg> },
    { key: "assistant", label: "AI Agent", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83"></path></svg> },
    { key: "settings", label: "Settings", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg> },
  ];

  const handlePromptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    setMessages(prev => [...prev, { role: "user", content: prompt }]);
    setTimeout(() => {
      setMessages(prev => [...prev, { role: "assistant", content: "I'm a dummy assistant, but I understand you want to: " + prompt }]);
    }, 1000);
    setPrompt("");
  };

  return (
    <div className="gmail-dashboard bg-bg-base text-text-primary h-full w-full rounded-xl overflow-hidden shadow-2xl flex border border-black/10 select-none text-left">
      {/* ── Sidebar ───────────────────────────────── */}
      <aside className="sidebar flex-shrink-0 w-64 border-r border-border flex flex-col p-4 bg-bg-card">
        <div className="sidebar-brand flex items-center gap-3 px-2 py-1 mb-6">
          <div className="brand-icon w-6 h-6 rounded overflow-hidden flex-shrink-0 flex items-center justify-center bg-transparent">
            <img src="/logo.svg" alt="neurosync logo" className="w-full h-full object-contain dark:invert" />
          </div>
          <h1 className="brand-title text-base font-semibold text-text-primary">neurosync</h1>
        </div>

        <div className="flex flex-col gap-3 mb-4">
          <button className="flex items-center justify-center gap-2 font-semibold text-[15px] cursor-pointer bg-white text-[#1a1a1a] rounded-xl p-3 border border-border shadow-sm hover:bg-gray-50 transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
            Compose
          </button>
        </div>

        <nav className="sidebar-nav flex flex-col gap-1">
          {primaryTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg border-none cursor-pointer font-medium text-sm w-full text-left transition-colors ${
                activeTab === tab.key ? 'bg-bg-elevated text-text-primary' : 'bg-transparent text-text-secondary hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              <span className={`flex items-center ${activeTab === tab.key ? 'opacity-100' : 'opacity-70'}`}>{tab.icon}</span>
              <span className="flex-1">{tab.label}</span>
              {tab.badge && (
                <span className="bg-[#e5e5e5] text-[#1a1a1a] text-[11px] font-semibold px-2 py-0.5 rounded-full">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}

          <div className="h-px bg-border my-3" />

          {secondaryTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg border-none cursor-pointer font-medium text-sm w-full text-left transition-colors ${
                activeTab === tab.key ? 'bg-bg-elevated text-text-primary' : 'bg-transparent text-text-secondary hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              <span className={`flex items-center ${activeTab === tab.key ? 'opacity-100' : 'opacity-70'}`}>{tab.icon}</span>
              <span className="flex-1">{tab.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer mt-auto pt-4 flex flex-col gap-2">
          <div className="flex items-center gap-3 px-3 py-2 bg-transparent rounded-lg border border-border cursor-pointer hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors w-full">
            <div className="w-8 h-8 rounded-full bg-text-primary text-bg-deep flex items-center justify-center font-semibold text-sm">
              D
            </div>
            <span className="text-sm font-medium text-text-primary whitespace-nowrap overflow-hidden text-ellipsis">
              Dipali
            </span>
          </div>
        </div>
      </aside>

      {/* ── Main Content ─────────────────────────── */}
      <main className="main-content flex-1 flex flex-col min-w-0 bg-bg-deep h-[800px] overflow-hidden relative">
        
        {/* INBOX SECTION */}
        {activeTab === "inbox" && (
          <div className="flex flex-col h-full w-full p-8 pb-0">
            <div className="sticky top-0 z-10 bg-bg-deep pb-4">
              <div className="panel-header flex items-center mb-6">
                <h2 className="text-2xl font-semibold m-0 text-text-primary flex-1">Inbox</h2>
                <div className="search-bar flex items-center bg-bg-card border border-border rounded-lg px-3 py-2 w-80 mx-4 shadow-sm">
                  <svg className="search-icon text-text-secondary mr-2" viewBox="0 0 24 24" fill="none" width="16" height="16">
                    <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
                    <path d="M16 16l4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  <input type="text" placeholder="Search emails…" className="bg-transparent border-none outline-none w-full text-sm text-text-primary" readOnly />
                </div>
              </div>

              <div className="flex border-b border-border gap-6">
                {[
                  { id: "primary", label: "Primary", badge: "33 new", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg> },
                  { id: "promotions", label: "Promotions", badge: "6 new", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg> },
                  { id: "social", label: "Social", badge: "21 new", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg> },
                  { id: "updates", label: "Updates", badge: "56 new", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg> }
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setInboxCategory(cat.id)}
                    className={`pb-3 bg-transparent border-none border-b-2 flex items-center gap-2 text-sm cursor-pointer transition-colors ${
                      inboxCategory === cat.id ? 'border-text-primary text-text-primary font-semibold' : 'border-transparent text-text-secondary font-medium hover:text-text-primary hover:bg-black/5'
                    }`}
                  >
                    <span>{cat.icon}</span>
                    {cat.label}
                    <span className={`ml-1 px-2 py-0.5 rounded-full text-[11px] font-bold tracking-wide ${
                      inboxCategory === cat.id ? 'bg-text-primary text-bg-deep' : 'bg-bg-elevated text-text-secondary'
                    }`}>
                      {cat.badge}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 pb-4 space-y-2">
              {DUMMY_MESSAGES.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onMouseEnter={() => setHoveredMessageId(msg.id)}
                  onMouseLeave={() => setHoveredMessageId(null)}
                  className="group relative flex items-start p-4 border-b border-border bg-bg-card hover:bg-bg-elevated hover:shadow-md cursor-pointer transition-all rounded-xl"
                >
                  <div className="flex-shrink-0 mr-4 mt-1 flex flex-col items-center gap-2">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-semibold text-lg shadow-sm" style={{ background: msg.color }}>
                      {msg.initial}
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0 pr-4">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-sm font-bold text-text-primary truncate pr-4">{msg.from}</h3>
                      <span className="text-[12px] font-medium text-text-secondary whitespace-nowrap">{msg.date}</span>
                    </div>
                    <h4 className="text-[13px] font-semibold text-text-primary mb-1 truncate">{msg.subject}</h4>
                    <p className="text-[13px] text-text-secondary truncate">{msg.snippet}</p>
                  </div>

                  {hoveredMessageId === msg.id && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 bg-bg-elevated/90 backdrop-blur-sm p-1.5 rounded-lg shadow-sm border border-border">
                      <button className="p-1.5 hover:bg-black/5 rounded-md text-text-secondary hover:text-text-primary transition-colors">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                      </button>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* CALENDAR SECTION */}
        {activeTab === "calendar" && (
          <div className="flex flex-col h-full w-full p-8 pb-0">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-text-primary">June 2026</h2>
              <div className="flex gap-2">
                <button className="px-4 py-2 border border-border rounded-lg bg-bg-card font-medium text-sm text-text-primary shadow-sm">Month</button>
                <button className="px-4 py-2 bg-text-primary text-bg-deep rounded-lg font-medium text-sm shadow-sm flex items-center gap-2">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14" /></svg>
                  Create
                </button>
              </div>
            </div>
            
            <div className="flex-1 bg-bg-card border border-border rounded-xl flex flex-col overflow-hidden">
              <div className="grid grid-cols-7 border-b border-border bg-bg-elevated text-center py-3">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
                  <div key={d} className="text-[13px] font-semibold text-text-secondary uppercase tracking-wider">{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 grid-rows-5 flex-1 bg-border gap-[1px]">
                {Array.from({length: 35}).map((_, i) => (
                  <div key={i} className="bg-bg-card p-2 text-sm text-text-primary font-medium hover:bg-bg-elevated cursor-pointer transition-colors relative">
                    <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full ${i === 18 ? 'bg-text-primary text-bg-deep font-bold' : ''}`}>
                      {i - 1 > 0 && i - 1 <= 30 ? i - 1 : ''}
                    </span>
                    {i === 18 && (
                      <div className="absolute top-10 left-2 right-2 bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded truncate dark:bg-blue-900/50 dark:text-blue-200 border border-blue-200 dark:border-blue-800">
                        1:00 PM Sync
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* AI AGENT SECTION */}
        {activeTab === "assistant" && (
          <div className="flex flex-col h-full w-full">
            <div className="p-8 pb-4">
              <h2 className="text-2xl font-semibold text-text-primary mb-2">AI Assistant</h2>
              <p className="text-sm text-text-secondary">Control your workspace workflows with natural language.</p>
            </div>
            <div className="flex-1 overflow-y-auto p-8 pt-0 flex flex-col gap-4">
              {messages.length === 0 ? (
                 <div className="flex flex-col items-center justify-center h-full text-center max-w-xl mx-auto">
                    <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1a1a1a] dark:bg-zinc-800 text-brand-green dark:text-white shadow-sm">
                      <Bot className="w-7 h-7" />
                    </div>
                    <h2 className="text-xl font-bold text-text-primary mb-2">Your personal AI operator.</h2>
                    <p className="text-sm text-text-secondary mb-8 leading-relaxed">
                      Ask neurosync to summarize threads, schedule meetings, draft replies, or organize your inbox securely.
                    </p>
                    <div className="grid grid-cols-2 gap-3 w-full">
                      {["Summarize my urgent emails", "Draft follow-ups from yesterday", "Find time for a 30 minute sync", "Archive low-signal newsletters"].map((suggestion, idx) => (
                        <button key={idx} onClick={() => setPrompt(suggestion)} className="p-4 rounded-xl border border-border bg-bg-card text-sm text-text-secondary hover:border-text-primary hover:text-text-primary transition-colors text-center shadow-sm">
                          {suggestion}
                        </button>
                      ))}
                    </div>
                 </div>
              ) : (
                messages.map((msg, i) => (
                  <div key={i} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${msg.role === 'assistant' ? 'bg-[#1a1a1a] dark:bg-zinc-800 text-brand-green dark:text-white' : 'bg-gray-100 dark:bg-zinc-800/50 text-[#1a1a1a] dark:text-white'}`}>
                      {msg.role === 'assistant' ? <Bot className="w-5 h-5" /> : <div className="text-sm font-semibold">U</div>}
                    </div>
                    <div className={`mt-1 rounded-2xl border border-border bg-bg-card p-4 text-sm leading-relaxed text-text-primary shadow-sm ${msg.role === 'user' ? 'rounded-tr-none' : 'rounded-tl-none'} max-w-[85%]`}>
                      {msg.content}
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="p-6 border-t border-border bg-bg-deep">
              <form onSubmit={handlePromptSubmit} className="relative flex items-center rounded-2xl border border-border bg-bg-card p-2 shadow-sm focus-within:ring-2 ring-brand-green/20">
                <input
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Tell the agent what outcome you want..."
                  className="w-full bg-transparent px-4 py-2 text-sm text-text-primary outline-none"
                />
                <button type="submit" className="flex h-9 w-9 items-center justify-center rounded-full bg-text-primary text-bg-deep hover:scale-105 transition-transform flex-shrink-0">
                  <Send className="w-4 h-4 ml-0.5" />
                </button>
              </form>
            </div>
          </div>
        )}

        {/* SETTINGS SECTION */}
        {activeTab === "settings" && (
          <div className="flex flex-col h-full w-full p-8 pb-0 overflow-y-auto">
            <h2 className="text-2xl font-semibold text-text-primary mb-8">Settings</h2>
            
            <div className="flex flex-col gap-6 max-w-3xl">
              {/* Profile Dummy */}
              <div className="bg-bg-elevated rounded-xl border border-border p-6 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-text-primary">Profile</h3>
                  <button className="px-3 py-1.5 text-sm font-medium border border-border rounded-md text-text-primary hover:bg-black/5 transition-colors">Edit</button>
                </div>
                <div className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">Display Name</label>
                    <input type="text" value="Dipali" readOnly className="w-full px-3 py-2 bg-bg-deep border border-border rounded-lg text-sm text-text-secondary" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">Email Address</label>
                    <input type="email" value="sharmadipali2000@gmail.com" readOnly className="w-full px-3 py-2 bg-bg-deep border border-border rounded-lg text-sm text-text-secondary" />
                  </div>
                </div>
              </div>

              {/* Connected Accounts Dummy */}
              <div className="bg-bg-elevated rounded-xl border border-border p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-text-primary mb-1">Connected Accounts</h3>
                <p className="text-sm text-text-secondary mb-6">Connect your Google accounts to enable Gmail and Calendar integrations.</p>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-bg-card rounded-xl border border-border">
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-yellow-400 flex items-center justify-center text-white font-bold text-lg">G</div>
                        <div>
                          <div className="font-semibold text-sm text-text-primary">Gmail</div>
                          <div className="text-xs text-text-secondary">Read, send, and manage your emails</div>
                        </div>
                     </div>
                     <button className="px-4 py-2 border border-red-500 text-red-500 bg-red-500/10 rounded-lg text-sm font-semibold">Disconnect</button>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-bg-card rounded-xl border border-border">
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-green-500 flex items-center justify-center text-white font-bold text-lg">C</div>
                        <div>
                          <div className="font-semibold text-sm text-text-primary">Google Calendar</div>
                          <div className="text-xs text-text-secondary">View, create, and manage your events</div>
                        </div>
                     </div>
                     <button className="px-4 py-2 border border-emerald-500 text-emerald-500 bg-emerald-500/10 rounded-lg text-sm font-semibold">Connect</button>
                  </div>
                </div>
              </div>

            </div>
            <div className="h-8"></div>
          </div>
        )}

      </main>
    </div>
  );
}
