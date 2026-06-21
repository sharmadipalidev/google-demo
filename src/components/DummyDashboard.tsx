"use client";

import { useState, useEffect } from "react";
import "../app/gmail/gmail.css";
import { Mail, Star, Send, FileEdit, ShieldAlert, Trash2, Calendar as CalendarIcon, Sparkles } from "lucide-react";

type Tab = "inbox" | "starred" | "sent" | "drafts" | "spam" | "trash" | "calendar" | "assistant" | "settings" | "overview";

const dummyEmails = [
  { id: "1", sender: "Google", time: "Jun 18, 2:02 PM", subject: "You shared some Google Account data with Clerk", snippet: "Keep track of your Google Account data...", initial: "G", color: "#f59e0b" },
  { id: "2", sender: "Vercel", time: "Jun 18, 1:58 PM", subject: "Failed production deployment on team 'Dipali Sharma's projects'", snippet: "There was an error deploying google-demo...", initial: "V", color: "#ea580c" },
  { id: "3", sender: "Vercel", time: "Jun 18, 1:39 PM", subject: "Failed production deployment on team 'Dipali Sharma's projects'", snippet: "There was an error deploying google-demo...", initial: "V", color: "#ea580c" },
  { id: "4", sender: "LinkedIn Job Recommendations", time: "Jun 18, 1:36 PM", subject: "Termgrid is hiring a Frontend Developer - Remote", snippet: "Discover roles that match your interests", initial: "L", color: "#f59e0b" },
  { id: "5", sender: "Vercel", time: "Jun 18, 1:33 PM", subject: "Failed production deployments on team 'Dipali Sharma's projects'", snippet: "There was an error deploying google-demo...", initial: "V", color: "#ea580c" }
];

export default function DummyDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [inboxCategory, setInboxCategory] = useState<"primary" | "promotions" | "social" | "updates">("primary");
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const primaryTabs: { key: Tab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { key: "overview", label: "Dashboard", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="9" rx="1"></rect><rect x="14" y="3" width="7" height="5" rx="1"></rect><rect x="14" y="12" width="7" height="9" rx="1"></rect><rect x="3" y="16" width="7" height="5" rx="1"></rect></svg> },
    { key: "inbox", label: "Inbox", icon: <Mail className="w-[18px] h-[18px]" />, badge: "28" },
    { key: "starred", label: "Starred", icon: <Star className="w-[18px] h-[18px]" /> },
    { key: "sent", label: "Sent", icon: <Send className="w-[18px] h-[18px]" /> },
    { key: "drafts", label: "Drafts", icon: <FileEdit className="w-[18px] h-[18px]" /> },
    { key: "spam", label: "Spam", icon: <ShieldAlert className="w-[18px] h-[18px]" /> },
    { key: "trash", label: "Trash", icon: <Trash2 className="w-[18px] h-[18px]" /> },
  ];

  const secondaryTabs: { key: Tab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { key: "calendar", label: "Calendar", icon: <CalendarIcon className="w-[18px] h-[18px]" /> },
    { key: "assistant", label: "AI Agent", icon: <Sparkles className="w-[18px] h-[18px]" /> },
    { key: "settings", label: "Settings", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg> },
  ];

  return (
    <div className={`gmail-dashboard dummy-dashboard ${theme === 'dark' ? 'dark' : ''}`} style={{ height: '800px', width: '100%', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border)' }}>
      {/* ── Sidebar ───────────────────────────────── */}
      <aside className="sidebar">
        <div className="sidebar-brand" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '6px 8px' }}>
          <div className="brand-icon" style={{ width: '24px', height: '24px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', boxShadow: 'none' }}>
            <img src="/logo.svg" alt="neurosync logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} className={theme === 'dark' ? 'invert' : ''} />
          </div>
          <div>
            <h1 className="brand-title" style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>neurosync</h1>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
          <button
            onClick={() => setActiveTab("compose" as any)}
            style={{
              background: '#ffffff',
              color: '#1a1a1a',
              borderRadius: '12px',
              padding: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontWeight: 600,
              fontSize: '15px',
              cursor: 'pointer',
              border: '1px solid var(--border)',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
            Compose
          </button>
        </div>

        <nav className="sidebar-nav" style={{ gap: '4px' }}>
          {primaryTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                setActiveTab(tab.key);
                setSelectedMessageId(null);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '8px 12px',
                borderRadius: '8px',
                background: activeTab === tab.key ? 'var(--bg-elevated)' : 'transparent',
                color: activeTab === tab.key ? 'var(--text-primary)' : 'var(--text-secondary)',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 500,
                fontSize: '14px',
                width: '100%',
                textAlign: 'left'
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', opacity: activeTab === tab.key ? 1 : 0.7 }}>{tab.icon}</span>
              <span style={{ flex: 1 }}>{tab.label}</span>
              {tab.badge && (
                <span style={{ background: '#e5e5e5', color: '#1a1a1a', fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '100px' }}>
                  {tab.badge}
                </span>
              )}
            </button>
          ))}

          <div style={{ height: '1px', background: 'var(--border)', margin: '12px 0' }} />

          {secondaryTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                setActiveTab(tab.key);
                setSelectedMessageId(null);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '8px 12px',
                borderRadius: '8px',
                background: activeTab === tab.key ? 'var(--bg-elevated)' : 'transparent',
                color: activeTab === tab.key ? 'var(--text-primary)' : 'var(--text-secondary)',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 500,
                fontSize: '14px',
                width: '100%',
                textAlign: 'left'
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', opacity: activeTab === tab.key ? 1 : 0.7 }}>{tab.icon}</span>
              <span style={{ flex: 1 }}>{tab.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer" style={{ marginTop: 'auto', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "8px 12px", background: "transparent", borderRadius: "var(--radius-lg)", border: "1px solid var(--border)", width: '100%' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--text-primary)', color: 'var(--bg-deep)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: '14px' }}>
              DI
            </div>
            <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              Dipali
            </span>
          </div>
        </div>
      </aside>

      {/* ── Main Content ─────────────────────────── */}
      <main className="main-content">
        
        {/* ── Overview Dashboard ── */}
        {activeTab === "overview" && (
          <section className="panel" id="panel-overview" style={{ padding: '32px', background: 'var(--bg-base)' }}>
            {/* Header */}
            <div style={{ position: 'sticky', top: '-28px', zIndex: 10, background: 'var(--bg-base)', padding: '28px 32px 0 32px', margin: '-60px -32px 0 -32px' }}>
              <div className="panel-header" style={{ marginBottom: '24px' }}>
                <h2 className="panel-title">Welcome back Dipali</h2>
                <div style={{ flex: 1 }} />
                <button
                  className="btn-refresh"
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
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
            
            {/* Quick Stats Row */}
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-text-primary">Quick Stats</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 items-start">
              {[
                { label: "Inbox", count: "28 Emails", icon: <Mail className="w-5 h-5" />, tab: "inbox" },
                { label: "Sent Items", count: "104 Emails", icon: <Send className="w-5 h-5" />, tab: "sent" },
                { label: "Drafts", count: "12 Saved", icon: <FileEdit className="w-5 h-5" />, tab: "drafts" },
                { label: "Starred", count: "5 Emails", icon: <Star className="w-5 h-5" />, tab: "starred" }
              ].map((stat, i) => (
                <div key={i} className="bg-bg-elevated rounded-[1.25rem] p-5 shadow-sm border border-border flex flex-col justify-between cursor-pointer hover:border-text-primary/20 transition-colors group" onClick={() => setActiveTab(stat.tab as any)}>
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 flex items-center justify-center flex-shrink-0 group-hover:bg-black/10 dark:group-hover:bg-white/10 transition-colors text-text-primary">
                      {stat.icon}
                    </div>
                    <div>
                      <h4 className="text-[15px] font-semibold text-text-primary">{stat.label}</h4>
                      <p className="text-[13px] text-text-secondary">{stat.count}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Middle Row (Mocked Activity Chart & Events) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="bg-bg-elevated rounded-[1.25rem] p-6 shadow-sm border border-border flex flex-col relative col-span-2 min-h-[300px] flex items-center justify-center">
                 <h3 className="text-lg font-semibold text-text-primary absolute top-6 left-6">Email Activity</h3>
                 <div className="flex items-end gap-2 h-32 w-full justify-around px-8 mt-12">
                   {[40, 20, 60, 80, 10, 100, 30].map((h, i) => (
                     <div key={i} className="w-4 bg-indigo-500 rounded-t-sm" style={{ height: `${h}%` }}></div>
                   ))}
                 </div>
              </div>
              <div className="bg-bg-elevated rounded-[1.25rem] p-6 shadow-sm border border-border flex flex-col">
                <h3 className="text-lg font-semibold text-text-primary mb-6">Daily Events</h3>
                <div className="text-sm text-text-secondary py-4 text-center">No upcoming events this week.</div>
              </div>
            </div>
          </section>
        )}

        {/* ── Inbox / Other Tabs ── */}
        {activeTab !== "overview" && (
          <section className="panel" id="panel-inbox">
            <div className="panel-header">
              <h2 className="panel-title capitalize">{activeTab}</h2>
              <div className="search-bar">
                <svg viewBox="0 0 24 24" fill="none" width="16" height="16" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                <input type="text" placeholder="Search emails..." />
              </div>
              <div className="flex gap-2">
                <button className="btn-icon">
                  <svg viewBox="0 0 24 24" fill="none" width="16" height="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
                </button>
                <button className="btn-icon">
                  <svg viewBox="0 0 24 24" fill="none" width="16" height="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
                </button>
                <button
                    className="btn-refresh"
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    title="Toggle Theme"
                    style={{ marginLeft: '16px' }}
                  >
                    {mounted && theme === 'dark' ? (
                      <svg viewBox="0 0 24 24" fill="none" width="18" height="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" /></svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" width="18" height="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
                    )}
                </button>
              </div>
            </div>

            {activeTab === "inbox" && (
              <div className="category-tabs" style={{ display: 'flex', gap: '32px', padding: '0 32px', borderBottom: '1px solid var(--border)' }}>
                {[
                  { id: "primary", label: "Primary", icon: <Mail className="w-4 h-4" />, count: "33 new", color: "var(--text-primary)" },
                  { id: "promotions", label: "Promotions", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>, count: "6 new", color: "var(--text-secondary)" },
                  { id: "social", label: "Social", icon: <Star className="w-4 h-4" />, count: "21 new", color: "var(--text-secondary)" },
                  { id: "updates", label: "Updates", icon: "", count: "56 new", color: "var(--text-secondary)" }
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setInboxCategory(cat.id as any)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '16px 0',
                      background: 'none',
                      border: 'none',
                      borderBottom: inboxCategory === cat.id ? '2px solid var(--text-primary)' : '2px solid transparent',
                      color: inboxCategory === cat.id ? 'var(--text-primary)' : 'var(--text-secondary)',
                      fontWeight: inboxCategory === cat.id ? 600 : 500,
                      fontSize: '14px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                    className="hover:text-text-primary"
                  >
                    {cat.icon && <span style={{ opacity: inboxCategory === cat.id ? 1 : 0.7 }}>{cat.icon}</span>}
                    <span>{cat.label}</span>
                    <span style={{ 
                      fontSize: '11px', 
                      fontWeight: 700, 
                      padding: '2px 8px', 
                      borderRadius: '100px',
                      background: inboxCategory === cat.id ? 'var(--text-primary)' : 'transparent',
                      color: inboxCategory === cat.id ? 'var(--bg-base)' : 'var(--text-primary)',
                      letterSpacing: '0.5px'
                    }}>
                      {cat.count}
                    </span>
                  </button>
                ))}
              </div>
            )}

            <div className="message-list" style={{ marginTop: '16px' }}>
              {activeTab === 'inbox' ? (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px', paddingInline: '32px' }}>
                  {dummyEmails.map((msg) => (
                    <li
                      key={msg.id}
                      className={`message-row ${selectedMessageId === msg.id ? 'bg-black/5 dark:bg-white/5 border-l-4 border-l-text-primary' : ''}`}
                      onClick={() => setSelectedMessageId(msg.id)}
                      id={`msg-${msg.id}`}
                    >
                      <div className="msg-avatar" style={{ background: msg.color, color: '#ffffff' }}>
                        {msg.initial}
                      </div>
                      <div className="msg-body">
                        <div className="msg-top-line">
                          <span className="msg-sender">{msg.sender}</span>
                          <span className="msg-time">{msg.time}</span>
                        </div>
                        <div className="msg-subject">{msg.subject}</div>
                        <p className="msg-snippet">{msg.snippet}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '64px', color: 'var(--text-secondary)' }}>
                  This section is empty in the dummy dashboard.
                </div>
              )}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
