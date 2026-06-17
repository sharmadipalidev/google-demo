"use client";

import { useState, useMemo, useEffect } from "react";
import { api } from "@/trpc/react";
import { AssistantPanel } from "@/app/_components/assistant-panel";
import { UserButton, useUser } from "@clerk/nextjs";
import { useTheme } from "next-themes";

// ─── Helpers ──────────────────────────────────────────────
function extractHeader(
  headers: Array<{ name?: string; value?: string }> | undefined,
  name: string,
): string {
  return headers?.find((h) => h.name?.toLowerCase() === name.toLowerCase())?.value ?? "";
}

function formatExactDate(date: string | number | Date | null | undefined): string {
  if (!date) return "";
  let d: Date;
  if (typeof date === 'string' && /^\d+$/.test(date)) {
    d = new Date(parseInt(date, 10));
  } else {
    d = new Date(date);
  }
  
  if (isNaN(d.getTime())) return "";

  return d.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

function decodeBase64URL(str: string) {
  try {
    return decodeURIComponent(
      atob(str.replace(/-/g, "+").replace(/_/g, "/"))
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
  } catch (e) {
    return "Error decoding email body";
  }
}

function getEmailBody(payload: any): { html: string; text: string } {
  let html = "";
  let text = "";
  if (!payload) return { html, text };

  if (payload.body?.data) {
    if (payload.mimeType === "text/html") html = decodeBase64URL(payload.body.data);
    else text = decodeBase64URL(payload.body.data);
  }

  if (payload.parts) {
    for (const part of payload.parts) {
      if (part.mimeType === "text/html" && part.body?.data) {
        html = decodeBase64URL(part.body.data);
      } else if (part.mimeType === "text/plain" && part.body?.data) {
        text = decodeBase64URL(part.body.data);
      } else if (part.parts) {
        const sub = getEmailBody(part);
        if (sub.html) html = sub.html;
        if (sub.text) text = sub.text;
      }
    }
  }
  return { html, text };
}

const avatarColors = [
  "#ef4444", "#f97316", "#f59e0b", "#10b981", 
  "#06b6d4", "#3b82f6", "#6366f1", "#a855f7", "#ec4899"
];

function getAvatarColor(str: string) {
  if (!str) return "#6b7280"; // fallback grey
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return avatarColors[Math.abs(hash) % avatarColors.length];
}

// ─── Tab Types ────────────────────────────────────────────
type Tab = "inbox" | "labels" | "drafts" | "compose" | "webhook" | "calendar" | "assistant" | "starred" | "sent" | "spam" | "trash" | "overview" | "integrations" | "billing" | "settings" | "important" | "schedule" | "manage_subscription" | "ai_agent";

// ─── Main Component ──────────────────────────────────────
export default function GmailDashboard() {
  const { user } = useUser();
  const fullName = user?.fullName || user?.firstName || "User";

  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [activeTab, setActiveTab] = useState<Tab>("inbox");
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [isAgentic, setIsAgentic] = useState(false);
  const [inboxCategory, setInboxCategory] = useState<"primary" | "promotions" | "social" | "updates">("primary");

  // ── Pagination state
  const [pageTokens, setPageTokens] = useState<string[]>([]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);

  useEffect(() => {
    setPageTokens([]);
    setCurrentPageIndex(0);
  }, [activeTab, inboxCategory, searchQuery]);

  // ── Compose form state
  const [composeTo, setComposeTo] = useState("");
  const [composeSubject, setComposeSubject] = useState("");
  const [composeBody, setComposeBody] = useState("");

  // ── Queries
  const defaultQuery = useMemo(() => {
    if (activeTab === "starred") return "is:starred";
    if (activeTab === "sent") return "in:sent";
    if (activeTab === "spam") return "in:spam";
    if (activeTab === "trash") return "in:trash";
    if (activeTab === "inbox") {
      return `in:inbox category:${inboxCategory}`;
    }
    return "";
  }, [activeTab, inboxCategory]);

  const messagesQuery = api.gmail.listMessages.useQuery(
    { maxResults: 15, q: searchQuery || defaultQuery || undefined, pageToken: pageTokens[currentPageIndex] || undefined },
    { enabled: ["inbox", "starred", "sent", "spam", "trash"].includes(activeTab), refetchInterval: 3000 },
  );

  const labelsQuery = api.gmail.listLabels.useQuery(undefined, {
    enabled: activeTab === "labels",
  });

  const categoryCountsQuery = api.gmail.getCategoryCounts.useQuery(undefined, {
    enabled: activeTab === "inbox",
    refetchInterval: 5000,
  });

  const draftsQuery = api.gmail.listDrafts.useQuery(
    { maxResults: 15 },
    { enabled: activeTab === "drafts" },
  );

  const webhookQuery = api.gmail.webhookStatus.useQuery(undefined, {
    enabled: activeTab === "webhook",
  });

  // ── Calendar View State
  const [calendarView, setCalendarView] = useState<"month" | "week" | "day">("month");
  const [currentMonthDate, setCurrentMonthDate] = useState(new Date());

  const calYear = currentMonthDate.getFullYear();
  const calMonth = currentMonthDate.getMonth();
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(calYear, calMonth, 1).getDay();

  const daysToRender = useMemo(() => {
    if (calendarView === "month") {
      return Array.from({ length: daysInMonth }).map((_, i) => new Date(calYear, calMonth, i + 1));
    } else if (calendarView === "week") {
      const startOfWeek = new Date(currentMonthDate);
      startOfWeek.setDate(currentMonthDate.getDate() - currentMonthDate.getDay());
      return Array.from({ length: 7 }).map((_, i) => {
        const d = new Date(startOfWeek);
        d.setDate(startOfWeek.getDate() + i);
        return d;
      });
    } else {
      return [currentMonthDate];
    }
  }, [calendarView, currentMonthDate, calYear, calMonth, daysInMonth]);

  const timeMin = useMemo(() => {
    if (daysToRender.length === 0) return new Date().toISOString();
    const d = new Date(daysToRender[0]);
    d.setHours(0,0,0,0);
    return d.toISOString();
  }, [daysToRender]);

  const timeMax = useMemo(() => {
    if (daysToRender.length === 0) return new Date().toISOString();
    const d = new Date(daysToRender[daysToRender.length - 1]);
    d.setHours(23,59,59,999);
    return d.toISOString();
  }, [daysToRender]);

  const calendarQuery = api.calendar.listEvents.useQuery(
    { maxResults: 100, q: searchQuery || undefined, timeMin, timeMax },
    { enabled: activeTab === "calendar", refetchInterval: 3000 },
  );

  // ── Calendar Grid Logic
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const currentMonthName = monthNames[calMonth];

  const handlePrev = () => {
    if (calendarView === "month") setCurrentMonthDate(new Date(calYear, calMonth - 1, currentMonthDate.getDate()));
    else if (calendarView === "week") setCurrentMonthDate(new Date(calYear, calMonth, currentMonthDate.getDate() - 7));
    else setCurrentMonthDate(new Date(calYear, calMonth, currentMonthDate.getDate() - 1));
  };
  const handleNext = () => {
    if (calendarView === "month") setCurrentMonthDate(new Date(calYear, calMonth + 1, currentMonthDate.getDate()));
    else if (calendarView === "week") setCurrentMonthDate(new Date(calYear, calMonth, currentMonthDate.getDate() + 7));
    else setCurrentMonthDate(new Date(calYear, calMonth, currentMonthDate.getDate() + 1));
  };
  const handleToday = () => setCurrentMonthDate(new Date());

  // ── Event Modal State
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [editingEventData, setEditingEventData] = useState<{ id?: string, summary: string, description: string, start: string, end: string, colorId: string } | null>(null);

  const createEventMutation = api.calendar.createEvent.useMutation({
    onSuccess: () => {
      setIsEventModalOpen(false);
      calendarQuery.refetch();
      alert("Event created!");
    },
    onError: (e) => alert(`Failed to create event: ${e.message}`)
  });

  const updateEventMutation = api.calendar.updateEvent.useMutation({
    onSuccess: () => {
      setIsEventModalOpen(false);
      calendarQuery.refetch();
      alert("Event updated!");
    },
    onError: (e) => alert(`Failed to update event: ${e.message}`)
  });

  const deleteEventMutation = api.calendar.deleteEvent.useMutation({
    onSuccess: () => {
      setIsEventModalOpen(false);
      calendarQuery.refetch();
      alert("Event deleted!");
    },
    onError: (e) => alert(`Failed to delete event: ${e.message}`)
  });

  const handleDeleteEvent = () => {
    if (!editingEventData?.id) return;
    if (confirm("Are you sure you want to delete this event?")) {
      deleteEventMutation.mutate({ id: editingEventData.id });
    }
  };

  const openAddEvent = (dateStr?: string) => {
    const start = dateStr ? `${dateStr}T09:00:00` : new Date().toISOString().slice(0, 16);
    const end = dateStr ? `${dateStr}T10:00:00` : new Date(Date.now() + 3600000).toISOString().slice(0, 16);
    setEditingEventData({ summary: "", description: "", start, end, colorId: "1" });
    setIsEventModalOpen(true);
  };

  const openEditEvent = (evt: any, e: React.MouseEvent) => {
    e.stopPropagation(); // prevent triggering the cell click
    const start = evt.start?.dateTime ? new Date(evt.start.dateTime as string).toISOString().slice(0, 16) : `${evt.start?.date}T00:00`;
    const end = evt.end?.dateTime ? new Date(evt.end.dateTime as string).toISOString().slice(0, 16) : `${evt.end?.date}T00:00`;
    setEditingEventData({
      id: evt.id,
      summary: evt.summary || "",
      description: evt.description || "",
      start,
      end,
      colorId: evt.colorId || "1"
    });
    setIsEventModalOpen(true);
  };

  const handleEventSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEventData) return;
    const startIso = new Date(editingEventData.start).toISOString();
    const endIso = new Date(editingEventData.end).toISOString();
    if (editingEventData.id) {
      updateEventMutation.mutate({
        id: editingEventData.id,
        summary: editingEventData.summary,
        description: editingEventData.description,
        start: startIso,
        end: endIso,
        colorId: editingEventData.colorId
      });
    } else {
      createEventMutation.mutate({
        summary: editingEventData.summary,
        description: editingEventData.description,
        start: startIso,
        end: endIso,
        colorId: editingEventData.colorId
      });
    }
  };



  const selectedMessage = api.gmail.getMessage.useQuery(
    { id: selectedMessageId! },
    { enabled: !!selectedMessageId },
  );

  const sendMutation = api.gmail.sendEmail.useMutation({
    onSuccess: () => {
      setComposeTo("");
      setComposeSubject("");
      setComposeBody("");
      alert("Email sent!");
    },
    onError: (e) => alert(`Send failed: ${e.message}`),
  });

  const modifyMutation = api.gmail.modifyMessage.useMutation({
    onSuccess: () => {
      messagesQuery.refetch();
      selectedMessage.refetch();
    },
    onError: (e) => alert(`Action failed: ${e.message}`),
  });

  const primaryTabs: { key: Tab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { key: "inbox", label: "Inbox", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>, badge: "28" },
    { key: "starred", label: "Starred", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg> },
    { key: "sent", label: "Sent", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg> },
    { key: "drafts", label: "Drafts", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg> },
    { key: "spam", label: "Spam", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg> },
    { key: "trash", label: "Trash", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg> },
  ];

  const secondaryTabs: { key: Tab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { key: "calendar", label: "Calendar", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg> },
    { key: "assistant", label: "AI Agent", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83"></path></svg> },
    { key: "settings", label: "Settings", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg> },
  ];

  return (
    <div className="gmail-dashboard">
      {/* ── Sidebar ───────────────────────────────── */}
      <aside className="sidebar">
        <div className="sidebar-brand" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '6px 8px' }}>
          <div className="brand-icon" style={{ width: '24px', height: '24px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', boxShadow: 'none' }}>
            <img src="/logo.svg" alt="neurosync logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} className="dark:invert" />
          </div>
          <div>
            <h1 className="brand-title" style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>neurosync</h1>
          </div>
        </div>



        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
          <button
            onClick={() => setActiveTab("compose")}
            style={{
              background: 'var(--text-primary)',
              color: 'var(--bg-deep)',
              borderRadius: '12px',
              padding: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontWeight: 600,
              fontSize: '15px',
              cursor: 'pointer',
              border: 'none',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
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
              {tab.badge && (
                <span style={{ background: '#e5e5e5', color: '#1a1a1a', fontSize: '10px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', letterSpacing: '0.5px' }}>
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer" style={{ marginTop: 'auto', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "8px 12px", background: "transparent", borderRadius: "var(--radius-lg)", border: "1px solid var(--border)", cursor: "pointer", transition: "all 0.2s", width: '100%' }} className="hover:bg-gray-50 dark:hover:bg-zinc-800/50">
            <UserButton appearance={{ elements: { userButtonBox: "flex-row", userButtonOuterIdentifier: "hidden" } }} />
            <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {fullName}
            </span>
          </div>
        </div>
      </aside>

      {/* ── Main Content ─────────────────────────── */}
      <main className="main-content">
        {/* ── Message Lists (Inbox, Starred, Sent, Spam, Trash) ── */}
        {["inbox", "starred", "sent", "spam", "trash"].includes(activeTab) && (
          <section className="panel" id={`panel-${activeTab}`}>
            <div style={{ position: 'sticky', top: '-28px', zIndex: 10, background: 'var(--bg-deep)', padding: '28px 32px 0 32px', margin: '-28px -32px 0 -32px' }}>
              <div className="panel-header" style={{ marginBottom: activeTab === "inbox" && !selectedMessageId ? '0' : '24px' }}>
              <h2 className="panel-title">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h2>
              <div className="search-bar">
                <svg className="search-icon" viewBox="0 0 24 24" fill="none" width="16" height="16">
                  <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
                  <path d="M16 16l4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <input
                  id="search-input"
                  type="text"
                  placeholder="Search emails…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") messagesQuery.refetch();
                  }}
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginRight: '16px' }}>
                <button
                  disabled={currentPageIndex === 0}
                  onClick={() => setCurrentPageIndex(p => Math.max(0, p - 1))}
                  style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '6px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', opacity: currentPageIndex === 0 ? 0.5 : 1, color: 'var(--text-primary)' }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
                </button>
                <button
                  disabled={!messagesQuery.data?.nextPageToken}
                  onClick={() => {
                    if (messagesQuery.data?.nextPageToken) {
                      const nextToken = messagesQuery.data.nextPageToken;
                      setPageTokens(prev => {
                        const newTokens = [...prev];
                        newTokens[currentPageIndex + 1] = nextToken;
                        return newTokens;
                      });
                      setCurrentPageIndex(p => p + 1);
                    }
                  }}
                  style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '6px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', opacity: !messagesQuery.data?.nextPageToken ? 0.5 : 1, color: 'var(--text-primary)' }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
                </button>
              </div>
              <button
                className="btn-refresh"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                title="Toggle Theme"
              >
                {mounted && theme === 'dark' ? (
                  <svg viewBox="0 0 24 24" fill="none" width="18" height="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" width="18" height="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
                )}
              </button>
            </div>

            {activeTab === "inbox" && !selectedMessageId && (
              <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', paddingTop: '16px', gap: '24px' }}>
                {[
                  { id: "primary", label: "Primary", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>, labelId: "CATEGORY_PERSONAL" },
                  { id: "promotions", label: "Promotions", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>, labelId: "CATEGORY_PROMOTIONS" },
                  { id: "social", label: "Social", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>, labelId: "CATEGORY_SOCIAL" },
                  { id: "updates", label: "Updates", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>, labelId: "CATEGORY_UPDATES" }
                ].map((cat) => {
                  const count = categoryCountsQuery.data?.[cat.labelId] || 0;
                  return (
                  <button
                    key={cat.id}
                    onClick={() => setInboxCategory(cat.id as any)}
                    style={{
                      padding: '12px 8px',
                      background: 'none',
                      border: 'none',
                      borderBottom: inboxCategory === cat.id ? '2px solid var(--text-primary)' : '2px solid transparent',
                      color: inboxCategory === cat.id ? 'var(--text-primary)' : 'var(--text-secondary)',
                      fontWeight: inboxCategory === cat.id ? 600 : 500,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '14px',
                      transition: 'all 0.2s'
                    }}
                  >
                    <span>{cat.icon}</span>
                    {cat.label}
                    <span style={{ 
                      marginLeft: '4px', 
                      background: inboxCategory === cat.id ? 'var(--text-primary)' : 'var(--bg-elevated)', 
                      color: inboxCategory === cat.id ? 'var(--bg-deep)' : 'var(--text-secondary)', 
                      fontSize: '11px', 
                      fontWeight: 700, 
                      padding: '2px 6px', 
                      borderRadius: '12px', 
                    }}>
                      {count} new
                    </span>
                  </button>
                )})}
              </div>
            )}
            </div>

            {messagesQuery.isLoading && <div className="loading-state"><div className="spinner" /><span>Fetching messages…</span></div>}
            {messagesQuery.error && <div className="error-state">⚠️ {messagesQuery.error.message}</div>}

            {!selectedMessageId && messagesQuery.data?.messages && (
              <ul className="message-list">
                {messagesQuery.data.messages.map((msg) => {
                  const senderName = extractHeader(msg.payload?.headers, "From")?.split('<')[0]?.trim() || "Unknown";
                  const initial = senderName.charAt(0).toUpperCase();
                  const avatarColor = getAvatarColor(senderName);
                  
                  return (
                  <li
                    key={msg.id}
                    className="message-row"
                    onClick={() => setSelectedMessageId(msg.id!)}
                    id={`msg-${msg.id}`}
                  >
                    <div className="msg-avatar" style={{ background: avatarColor, color: '#ffffff' }}>
                      {initial}
                    </div>
                    <div className="msg-body">
                      <div className="msg-top-line">
                        <span className="msg-sender">
                          {senderName === "Unknown" ? `ID: ${msg.id?.slice(0, 8)}…` : senderName}
                        </span>
                        <span className="msg-time">{formatExactDate(msg.internalDate)}</span>
                      </div>
                      <div className="msg-subject">
                        {extractHeader(msg.payload?.headers, "Subject") || "(No Subject)"}
                      </div>
                      <p className="msg-snippet">{msg.snippet || "No preview available"}</p>
                      {msg.labelIds && (
                        <div className="msg-labels">
                          {msg.labelIds.slice(0, 3).map((lbl) => (
                            <span key={lbl} className="label-chip">{lbl}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </li>
                )})}
              </ul>
            )}

            {selectedMessageId && selectedMessage.data && (
              <div className="message-detail" id="message-detail-view">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <button className="btn-back" onClick={() => setSelectedMessageId(null)} style={{ margin: 0 }}>
                    ← Back
                  </button>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      onClick={() => modifyMutation.mutate({ id: selectedMessageId, addLabelIds: selectedMessage.data?.labelIds?.includes('STARRED') ? [] : ['STARRED'], removeLabelIds: selectedMessage.data?.labelIds?.includes('STARRED') ? ['STARRED'] : [] })}
                      disabled={modifyMutation.isPending}
                      style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg-elevated)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px' }}
                    >
                      {selectedMessage.data?.labelIds?.includes('STARRED') ? '⭐ Unstar' : '☆ Star'}
                    </button>
                    <button 
                      onClick={() => { modifyMutation.mutate({ id: selectedMessageId, addLabelIds: ['SPAM'], removeLabelIds: ['INBOX'] }); setSelectedMessageId(null); }}
                      disabled={modifyMutation.isPending}
                      style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg-elevated)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px' }}
                    >
                      🚫 Spam
                    </button>
                    <button 
                      onClick={() => { modifyMutation.mutate({ id: selectedMessageId, addLabelIds: ['TRASH'], removeLabelIds: ['INBOX'] }); setSelectedMessageId(null); }}
                      disabled={modifyMutation.isPending}
                      style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg-elevated)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: '#ef4444' }}
                    >
                      🗑️ Trash
                    </button>
                  </div>
                </div>
                <div className="detail-card">
                  <h3 className="detail-subject">
                    {extractHeader(selectedMessage.data.payload?.headers, "Subject") || "(No Subject)"}
                  </h3>
                  <div className="detail-meta">
                    <span><strong>From:</strong> {extractHeader(selectedMessage.data.payload?.headers, "From")}</span>
                    <span><strong>To:</strong> {extractHeader(selectedMessage.data.payload?.headers, "To")}</span>
                    <span><strong>Date:</strong> {extractHeader(selectedMessage.data.payload?.headers, "Date")}</span>
                  </div>
                  <div className="detail-body">
                    {(() => {
                      const bodyData = getEmailBody(selectedMessage.data.payload);
                      if (bodyData.html) {
                        return <iframe srcDoc={bodyData.html} style={{ width: '100%', minHeight: '500px', border: 'none', background: '#fff', borderRadius: '8px' }} sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin" />;
                      } else if (bodyData.text) {
                        return <div style={{ whiteSpace: "pre-wrap" }}>{bodyData.text}</div>;
                      } else {
                        return <div>No body content available</div>;
                      }
                    })()}
                  </div>
                  {selectedMessage.data.labelIds && (
                    <div className="detail-labels">
                      {selectedMessage.data.labelIds.map((lbl) => (
                        <span key={lbl} className="label-chip">{lbl}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {!messagesQuery.isLoading && !messagesQuery.error && !messagesQuery.data?.messages?.length && (
              <div className="empty-state">
                <span className="empty-icon">📭</span>
                <p>No messages found</p>
              </div>
            )}
          </section>
        )}

        {/* ── Labels ───────────────────────────────── */}
        {activeTab === "labels" && (
          <section className="panel" id="panel-labels">
            <div className="panel-header">
              <h2 className="panel-title">Labels</h2>
              <button className="btn-refresh" onClick={() => labelsQuery.refetch()} id="btn-refresh-labels">
                <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
                  <path d="M21 2v6h-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M3 12a9 9 0 0115.36-6.36L21 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M3 22v-6h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M21 12a9 9 0 01-15.36 6.36L3 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>

            {labelsQuery.isLoading && <div className="loading-state"><div className="spinner" /><span>Loading labels…</span></div>}
            {labelsQuery.error && <div className="error-state">⚠️ {labelsQuery.error.message}</div>}

            {labelsQuery.data?.labels && (
              <div className="labels-grid">
                {labelsQuery.data.labels.map((label) => (
                  <div key={label.id} className="label-card" id={`label-${label.id}`}>
                    <div className="label-card-header">
                      <span
                        className="label-color-dot"
                        style={{
                          background: label.color?.backgroundColor ?? "var(--accent)",
                        }}
                      />
                      <span className="label-name">{label.name}</span>
                    </div>
                    <div className="label-card-stats">
                      <div className="stat">
                        <span className="stat-value">{label.messagesTotal ?? 0}</span>
                        <span className="stat-label">messages</span>
                      </div>
                      <div className="stat">
                        <span className="stat-value">{label.messagesUnread ?? 0}</span>
                        <span className="stat-label">unread</span>
                      </div>
                      <div className="stat">
                        <span className="stat-value">{label.threadsTotal ?? 0}</span>
                        <span className="stat-label">threads</span>
                      </div>
                    </div>
                    <span className={`label-type-badge ${label.type === "system" ? "system" : "user"}`}>
                      {label.type ?? "unknown"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* ── Drafts ───────────────────────────────── */}
        {activeTab === "drafts" && (
          <section className="panel" id="panel-drafts">
            <div className="panel-header">
              <h2 className="panel-title">Drafts</h2>
              <button className="btn-refresh" onClick={() => draftsQuery.refetch()} id="btn-refresh-drafts">
                <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
                  <path d="M21 2v6h-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M3 12a9 9 0 0115.36-6.36L21 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M3 22v-6h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M21 12a9 9 0 01-15.36 6.36L3 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>

            {draftsQuery.isLoading && <div className="loading-state"><div className="spinner" /><span>Loading drafts…</span></div>}
            {draftsQuery.error && <div className="error-state">⚠️ {draftsQuery.error.message}</div>}

            {draftsQuery.data?.drafts && draftsQuery.data.drafts.length > 0 ? (
              <ul className="message-list">
                {draftsQuery.data.drafts.map((draft) => (
                  <li key={draft.id} className="message-row" id={`draft-${draft.id}`}>
                    <div className="msg-avatar draft">📝</div>
                    <div className="msg-body">
                      <div className="msg-top-line">
                        <span className="msg-id">Draft {draft.id?.slice(0, 10)}…</span>
                      </div>
                      <p className="msg-snippet">{draft.message?.snippet || "Empty draft"}</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              !draftsQuery.isLoading && !draftsQuery.error && (
                <div className="empty-state">
                  <span className="empty-icon">📄</span>
                  <p>No drafts found</p>
                </div>
              )
            )}
          </section>
        )}

        {/* ── Compose ──────────────────────────────── */}
        {activeTab === "compose" && (
          <section className="panel" id="panel-compose">
            <div className="panel-header">
              <h2 className="panel-title">Compose Email</h2>
            </div>
            <form
              className="compose-form"
              onSubmit={(e) => {
                e.preventDefault();
                sendMutation.mutate({
                  to: composeTo,
                  subject: composeSubject,
                  body: composeBody,
                });
              }}
            >
              <div className="form-group">
                <label htmlFor="compose-to">To</label>
                <input
                  id="compose-to"
                  type="email"
                  placeholder="recipient@example.com"
                  value={composeTo}
                  onChange={(e) => setComposeTo(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="compose-subject">Subject</label>
                <input
                  id="compose-subject"
                  type="text"
                  placeholder="Email subject"
                  value={composeSubject}
                  onChange={(e) => setComposeSubject(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="compose-body">Body</label>
                <textarea
                  id="compose-body"
                  rows={8}
                  placeholder="Write your message here…"
                  value={composeBody}
                  onChange={(e) => setComposeBody(e.target.value)}
                  required
                />
              </div>
              <button
                type="submit"
                className="btn-send"
                id="btn-send-email"
                disabled={sendMutation.isPending}
              >
                {sendMutation.isPending ? (
                  <><div className="spinner small" /> Sending…</>
                ) : (
                  <>
                    <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
                      <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M22 2l-7 20-4-9-9-4 20-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Send Email
                  </>
                )}
              </button>
            </form>
          </section>
        )}

        {/* ── Calendar ─────────────────────────────── */}
        {activeTab === "calendar" && (
          <section className="panel calendar-panel" id="panel-calendar">
            <div className="calendar-toolbar">
              <div className="calendar-toolbar-left">
                <h2 className="calendar-month-title">
                  {calendarView === "month" && `${currentMonthName} ${calYear}`}
                  {calendarView === "week" && `${monthNames[daysToRender[0].getMonth()]} ${daysToRender[0].getFullYear()}`}
                  {calendarView === "day" && `${monthNames[currentMonthDate.getMonth()]} ${currentMonthDate.getDate()}, ${currentMonthDate.getFullYear()}`}
                </h2>
                <div className="calendar-nav-buttons">
                  <button className="btn-icon" onClick={handlePrev}>
                    <svg viewBox="0 0 24 24" fill="none" width="18" height="18"><path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </button>
                  <button className="btn-icon" onClick={handleNext}>
                    <svg viewBox="0 0 24 24" fill="none" width="18" height="18"><path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </button>
                  <button className="btn-today" onClick={handleToday}>Today</button>
                  <select
                    value={calendarView}
                    onChange={(e) => setCalendarView(e.target.value as any)}
                    style={{ marginLeft: '12px', padding: '6px 12px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-primary)', fontWeight: 500, cursor: 'pointer', outline: 'none', appearance: 'none', WebkitAppearance: 'none', paddingRight: '32px', backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%238b8b9e%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', backgroundSize: '10px' }}
                  >
                    <option value="month">Month</option>
                    <option value="week">Week</option>
                    <option value="day">Day</option>
                  </select>
                  <button style={{ padding: '6px 16px', marginLeft: '12px', background: 'var(--accent)', color: 'var(--bg-deep)', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s', boxShadow: 'var(--shadow-sm)' }} onClick={() => openAddEvent()} onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-1px)'} onMouseOut={(e) => e.currentTarget.style.transform = 'none'}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
                    Create
                  </button>
                </div>
              </div>
              <div className="search-bar calendar-search">
                <svg className="search-icon" viewBox="0 0 24 24" fill="none" width="16" height="16">
                  <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
                  <path d="M16 16l4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <input
                  id="search-calendar-input"
                  type="text"
                  placeholder="Search events…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") calendarQuery.refetch();
                  }}
                />
              </div>
              <button
                className="btn-icon"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                title="Toggle Theme"
              >
                {mounted && theme === 'dark' ? (
                  <svg viewBox="0 0 24 24" fill="none" width="18" height="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" width="18" height="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
                )}
              </button>
            </div>

            {calendarQuery.isLoading && <div className="loading-state"><div className="spinner" /><span>Fetching events…</span></div>}
            {calendarQuery.error && <div className="error-state">⚠️ {calendarQuery.error.message}</div>}

            {calendarQuery.data?.authError && (
              <div className="error-state" style={{ flexDirection: 'column', gap: '12px' }}>
                <div>⚠️ Authentication Required: {calendarQuery.data.authError}</div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  Please run <code>npx corsair auth -p googlecalendar</code> in your terminal and follow the instructions to link your account.
                </div>
              </div>
            )}

            {!calendarQuery.isLoading && !calendarQuery.data?.authError && (
              <div className="calendar-view">
                {calendarView === "month" ? (
                  <>
                    <div className="calendar-weekdays">
                      {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                        <div key={day} className="calendar-weekday">{day}</div>
                      ))}
                    </div>
                    <div className="calendar-grid">
                      {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                        <div key={`empty-${i}`} className="calendar-cell empty"></div>
                      ))}
                      {daysToRender.map((dateObj) => {
                        const dateStr = dateObj.toISOString().split('T')[0];
                        const dayNum = dateObj.getDate();
                        const isToday = new Date().toISOString().split('T')[0] === dateStr;
                        
                        const dayEvents = calendarQuery.data?.items?.filter((evt: any) => {
                          const evtStartStr = evt.start?.dateTime ? new Date(evt.start.dateTime as string).toISOString().split('T')[0] : evt.start?.date;
                          return evtStartStr === dateStr;
                        }) || [];

                        return (
                          <div key={dateStr} className={`calendar-cell ${isToday ? 'today' : ''}`} onClick={() => openAddEvent(dateStr)}>
                            <div className="calendar-cell-header">
                              <span className={`calendar-day-number ${isToday ? 'active' : ''}`}>{dayNum}</span>
                            </div>
                            <div className="calendar-events-container">
                              {dayEvents.map((evt: any) => (
                                <div key={evt.id} className={`calendar-event-chip color-${evt.colorId || '1'}`} title={evt.summary} onClick={(e) => openEditEvent(evt, e)}>
                                  {evt.start?.dateTime ? (
                                    <span className="calendar-event-time">
                                      {new Date(evt.start.dateTime as string).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                  ) : null}
                                  <span className="calendar-event-title">{evt.summary || "(No Title)"}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                      {Array.from({ length: (7 - ((firstDayOfMonth + daysInMonth) % 7)) % 7 }).map((_, i) => (
                        <div key={`empty-end-${i}`} className="calendar-cell empty"></div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="time-grid-container">
                    <div className="time-grid-header">
                      <div className="time-grid-tz-spacer">GMT+00</div>
                      <div className="time-grid-day-headers">
                        {daysToRender.map((dateObj) => {
                          const dateStr = dateObj.toISOString().split('T')[0];
                          const dayNum = dateObj.getDate();
                          const isToday = new Date().toISOString().split('T')[0] === dateStr;
                          return (
                            <div key={dateStr} className={`time-grid-day-header ${isToday ? 'today' : ''}`}>
                              <span className="day-name">{["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"][dateObj.getDay()]}</span>
                              <span className={`day-number ${isToday ? 'active' : ''}`}>{dayNum}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    <div className="time-grid-body-scroll" ref={(el) => { if (el && !el.dataset.scrolled) { el.scrollTop = (new Date().getHours() * 60) - 100; el.dataset.scrolled = "true"; } }}>
                      <div className="time-grid-body">
                        <div className="time-grid-hours">
                          {Array.from({ length: 24 }).map((_, i) => (
                            <div key={`hour-${i}`} className="time-grid-hour-label">
                              <span>{i === 0 ? '' : i < 12 ? `${i} AM` : i === 12 ? '12 PM' : `${i - 12} PM`}</span>
                            </div>
                          ))}
                        </div>
                        <div className="time-grid-days">
                          {daysToRender.map((dateObj) => {
                            const dateStr = dateObj.toISOString().split('T')[0];
                            const dayEvents = calendarQuery.data?.items?.filter((evt: any) => {
                              const evtStartStr = evt.start?.dateTime ? new Date(evt.start.dateTime as string).toISOString().split('T')[0] : evt.start?.date;
                              return evtStartStr === dateStr;
                            }) || [];

                            const isToday = new Date().toISOString().split('T')[0] === dateStr;

                            return (
                              <div key={dateStr} className="time-grid-day-column" onClick={() => openAddEvent(dateStr)}>
                                {Array.from({ length: 24 }).map((_, i) => (
                                  <div key={`grid-line-${i}`} className="time-grid-line"></div>
                                ))}
                                
                                {isToday && (
                                  <div className="current-time-line" style={{ top: `${(new Date().getHours() * 60 + new Date().getMinutes())}px` }}>
                                    <div className="current-time-dot"></div>
                                  </div>
                                )}

                                {dayEvents.map((evt: any) => {
                                  const isAllDay = !evt.start?.dateTime;
                                  if (isAllDay) return null;
                                  
                                  const startDate = new Date(evt.start.dateTime);
                                  const endDate = new Date(evt.end?.dateTime || evt.start.dateTime);
                                  
                                  const startMin = startDate.getHours() * 60 + startDate.getMinutes();
                                  const durationMin = Math.max((endDate.getTime() - startDate.getTime()) / 60000, 30);
                                  
                                  const formatTime = (d: Date) => {
                                    let hours = d.getHours();
                                    const mins = d.getMinutes();
                                    const ampm = hours >= 12 ? 'pm' : 'am';
                                    hours = hours % 12;
                                    hours = hours ? hours : 12;
                                    return `${hours}:${mins < 10 ? '0'+mins : mins}${ampm}`;
                                  };

                                  return (
                                    <div 
                                      key={evt.id} 
                                      className={`time-grid-event color-${evt.colorId || '1'}`}
                                      style={{ top: `${startMin}px`, height: `${durationMin}px` }}
                                      title={evt.summary} 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        openEditEvent(evt, e);
                                      }}
                                    >
                                      <div className="time-grid-event-title">{evt.summary || "(No Title)"}</div>
                                      <div className="time-grid-event-time">{formatTime(startDate)} – {formatTime(endDate)}</div>
                                    </div>
                                  );
                                })}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>
        )}

        {/* ── Webhook Status ───────────────────────── */}
        {activeTab === "webhook" && (
          <section className="panel" id="panel-webhook">
            <div className="panel-header">
              <h2 className="panel-title">Webhook Status</h2>
              <button className="btn-refresh" onClick={() => webhookQuery.refetch()} id="btn-refresh-webhook">
                <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
                  <path d="M21 2v6h-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M3 12a9 9 0 0115.36-6.36L21 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M3 22v-6h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M21 12a9 9 0 01-15.36 6.36L3 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>

            {webhookQuery.isLoading && <div className="loading-state"><div className="spinner" /><span>Checking status…</span></div>}
            {webhookQuery.error && <div className="error-state">⚠️ {webhookQuery.error.message}</div>}

            {webhookQuery.data && (
              <div className="webhook-info">
                <div className="webhook-hero">
                  <div className="webhook-status-badge active">
                    <span className="pulse-dot" />
                    {webhookQuery.data.status.toUpperCase()}
                  </div>
                  <p className="webhook-updated">Last checked: {webhookQuery.data.timestamp}</p>
                </div>

                <div className="webhook-details">
                  <div className="detail-row">
                    <span className="detail-key">Endpoint</span>
                    <code className="detail-value">{webhookQuery.data.endpoint}</code>
                  </div>
                  <div className="detail-row">
                    <span className="detail-key">Tenant ID</span>
                    <code className="detail-value">{webhookQuery.data.tenantId}</code>
                  </div>
                  <div className="detail-row">
                    <span className="detail-key">Plugins</span>
                    <div className="plugin-badges">
                      {webhookQuery.data.plugins.map((p) => (
                        <span key={p} className="plugin-badge">{p}</span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="webhook-test-section">
                  <h3>Test Your Webhook</h3>
                  <p>Send a test request to your webhook endpoint:</p>
                  <code className="code-block">
                    {`curl -X POST http://localhost:3000/api/webhooks \\
  -H "Content-Type: application/json" \\
  -d '{"test": true}'`}
                  </code>
                </div>
              </div>
            )}
          </section>
        )}

        {/* ── AI Assistant ───────────────────────────── */}
        {activeTab === "assistant" && (
          <section className="panel" id="panel-assistant" style={{ padding: 0, overflow: 'hidden' }}>
            <AssistantPanel />
          </section>
        )}

        {/* ── Settings ────────────────────────────── */}
        {activeTab === "settings" && (
          <section className="panel" id="panel-settings">
            <div className="panel-header">
              <h2 className="panel-title">Settings</h2>
            </div>
            <div style={{ padding: '24px', background: 'var(--bg-elevated)', borderRadius: '12px', border: '1px solid var(--border)', margin: '24px' }}>
              <h3 style={{ marginBottom: '16px', color: 'var(--text-primary)' }}>Preferences</h3>
              <p style={{ color: 'var(--text-secondary)' }}>Configure your account settings, notifications, and AI assistant behavior here.</p>
            </div>
          </section>
        )}
      </main>

      {/* ── Event Modal ──────────────────────────────── */}
      {isEventModalOpen && editingEventData && (
        <div className="modal-overlay" onClick={() => setIsEventModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">{editingEventData.id ? "Edit Event" : "New Event"}</h2>
            <form className="compose-form" style={{ maxWidth: '100%', padding: '20px 0 0', border: 'none', background: 'transparent' }} onSubmit={handleEventSubmit}>
              <div className="form-group">
                <label>Event Title</label>
                <input type="text" value={editingEventData.summary} onChange={e => setEditingEventData({...editingEventData, summary: e.target.value})} required autoFocus placeholder="Add title" />
              </div>
              <div className="form-row" style={{ display: 'flex', gap: '16px' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Start Time</label>
                  <input type="datetime-local" value={editingEventData.start} onChange={e => setEditingEventData({...editingEventData, start: e.target.value})} required />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>End Time</label>
                  <input type="datetime-local" value={editingEventData.end} onChange={e => setEditingEventData({...editingEventData, end: e.target.value})} required />
                </div>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea rows={3} value={editingEventData.description} onChange={e => setEditingEventData({...editingEventData, description: e.target.value})} placeholder="Add description" />
              </div>
              <div className="form-group">
                <label>Color</label>
                <div className="color-picker">
                  {["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"].map(c => (
                    <button key={c} type="button" className={`color-swatch color-${c} ${editingEventData.colorId === c ? 'selected' : ''}`} onClick={() => setEditingEventData({...editingEventData, colorId: c})} />
                  ))}
                </div>
              </div>
              <div className="modal-actions" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px' }}>
                <div>
                  {editingEventData.id && (
                    <button type="button" className="btn-back" style={{ color: 'var(--error, #f44336)', marginBottom: 0 }} onClick={handleDeleteEvent} disabled={deleteEventMutation.isPending}>
                      {deleteEventMutation.isPending ? "Deleting..." : "Delete"}
                    </button>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button type="button" className="btn-back" style={{ marginBottom: 0 }} onClick={() => setIsEventModalOpen(false)}>Cancel</button>
                  <button type="submit" className="btn-send" disabled={createEventMutation.isPending || updateEventMutation.isPending || deleteEventMutation.isPending}>
                    {createEventMutation.isPending || updateEventMutation.isPending ? "Saving..." : "Save Event"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
