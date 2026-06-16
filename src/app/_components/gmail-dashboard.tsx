"use client";

import { useState, useMemo } from "react";
import { api } from "@/trpc/react";
import { AssistantPanel } from "@/app/_components/assistant-panel";
import { UserButton } from "@clerk/nextjs";

// ─── Helpers ──────────────────────────────────────────────
function extractHeader(
  headers: Array<{ name?: string; value?: string }> | undefined,
  name: string,
): string {
  return headers?.find((h) => h.name?.toLowerCase() === name.toLowerCase())?.value ?? "";
}

function timeAgo(date: string | number | Date | null | undefined): string {
  if (!date) return "";
  const ms = Date.now() - new Date(date as string).getTime();
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

// ─── Tab Types ────────────────────────────────────────────
type Tab = "inbox" | "labels" | "drafts" | "compose" | "webhook" | "calendar" | "assistant";

// ─── Main Component ──────────────────────────────────────
export default function GmailDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>("inbox");
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // ── Compose form state
  const [composeTo, setComposeTo] = useState("");
  const [composeSubject, setComposeSubject] = useState("");
  const [composeBody, setComposeBody] = useState("");

  // ── Queries
  const messagesQuery = api.gmail.listMessages.useQuery(
    { maxResults: 15, q: searchQuery || undefined },
    { enabled: activeTab === "inbox", refetchInterval: 3000 },
  );

  const labelsQuery = api.gmail.listLabels.useQuery(undefined, {
    enabled: activeTab === "labels",
  });

  const draftsQuery = api.gmail.listDrafts.useQuery(
    { maxResults: 15 },
    { enabled: activeTab === "drafts" },
  );

  const webhookQuery = api.gmail.webhookStatus.useQuery(undefined, {
    enabled: activeTab === "webhook",
  });

  // ── Calendar View State
  const [currentMonthDate, setCurrentMonthDate] = useState(new Date());

  const timeMin = useMemo(() => {
    const d = new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth(), 1);
    return d.toISOString();
  }, [currentMonthDate]);

  const timeMax = useMemo(() => {
    const d = new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() + 1, 0, 23, 59, 59);
    return d.toISOString();
  }, [currentMonthDate]);

  const calendarQuery = api.calendar.listEvents.useQuery(
    { maxResults: 100, q: searchQuery || undefined, timeMin, timeMax },
    { enabled: activeTab === "calendar", refetchInterval: 3000 },
  );

  // ── Calendar Grid Logic
  const calYear = currentMonthDate.getFullYear();
  const calMonth = currentMonthDate.getMonth();
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(calYear, calMonth, 1).getDay();
  
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const currentMonthName = monthNames[calMonth];

  const handlePrevMonth = () => setCurrentMonthDate(new Date(calYear, calMonth - 1, 1));
  const handleNextMonth = () => setCurrentMonthDate(new Date(calYear, calMonth + 1, 1));
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
      alert("Email sent successfully!");
    },
    onError: (e) => alert(`Send failed: ${e.message}`),
  });

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: "inbox", label: "Inbox", icon: "📥" },
    { key: "labels", label: "Labels", icon: "🏷️" },
    { key: "drafts", label: "Drafts", icon: "📝" },
    { key: "compose", label: "Compose", icon: "✉️" },
    { key: "calendar", label: "Calendar", icon: "📅" },
    { key: "webhook", label: "Webhooks", icon: "🔔" },
    { key: "assistant", label: "AI Assistant", icon: "✨" },
  ];

  return (
    <div className="gmail-dashboard">
      {/* ── Sidebar ───────────────────────────────── */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-icon">
            <svg viewBox="0 0 24 24" fill="none" width="28" height="28">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" strokeWidth="1.5" />
              <path d="M22 6l-10 7L2 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <h1 className="brand-title">Gmail Tester</h1>
            <p className="brand-sub">Corsair Integration</p>
          </div>
        </div>



        <nav className="sidebar-nav">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              id={`tab-${tab.key}`}
              onClick={() => {
                setActiveTab(tab.key);
                setSelectedMessageId(null);
              }}
              className={`nav-item ${activeTab === tab.key ? "active" : ""}`}
            >
              <span className="nav-icon">{tab.icon}</span>
              <span className="nav-label">{tab.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="status-indicator" style={{ marginBottom: "1rem" }}>
            <span className="status-dot" />
            <span>Webhook Active</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "0 10px" }}>
            <UserButton showName />
          </div>
        </div>
      </aside>

      {/* ── Main Content ─────────────────────────── */}
      <main className="main-content">
        {/* ── Inbox ────────────────────────────────── */}
        {activeTab === "inbox" && (
          <section className="panel" id="panel-inbox">
            <div className="panel-header">
              <h2 className="panel-title">Inbox</h2>
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
              <button className="btn-refresh" onClick={() => messagesQuery.refetch()} id="btn-refresh-inbox">
                <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
                  <path d="M21 2v6h-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M3 12a9 9 0 0115.36-6.36L21 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M3 22v-6h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M21 12a9 9 0 01-15.36 6.36L3 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>

            {messagesQuery.isLoading && <div className="loading-state"><div className="spinner" /><span>Fetching messages…</span></div>}
            {messagesQuery.error && <div className="error-state">⚠️ {messagesQuery.error.message}</div>}

            {!selectedMessageId && messagesQuery.data?.messages && (
              <ul className="message-list">
                {messagesQuery.data.messages.map((msg) => (
                  <li
                    key={msg.id}
                    className="message-row"
                    onClick={() => setSelectedMessageId(msg.id!)}
                    id={`msg-${msg.id}`}
                  >
                    <div className="msg-avatar">
                      {msg.snippet?.charAt(0)?.toUpperCase() ?? "?"}
                    </div>
                    <div className="msg-body">
                      <div className="msg-top-line">
                        <span className="msg-sender">
                          {extractHeader(msg.payload?.headers, "From")?.split('<')[0]?.trim() || `ID: ${msg.id?.slice(0, 8)}…`}
                        </span>
                        <span className="msg-time">{timeAgo(msg.internalDate)}</span>
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
                ))}
              </ul>
            )}

            {selectedMessageId && selectedMessage.data && (
              <div className="message-detail" id="message-detail-view">
                <button className="btn-back" onClick={() => setSelectedMessageId(null)}>
                  ← Back to Inbox
                </button>
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
                    {selectedMessage.data.snippet ?? "No body content available"}
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
                <h2 className="calendar-month-title">{currentMonthName} {calYear}</h2>
                <div className="calendar-nav-buttons">
                  <button className="btn-icon" onClick={handlePrevMonth}>
                    <svg viewBox="0 0 24 24" fill="none" width="18" height="18"><path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </button>
                  <button className="btn-icon" onClick={handleNextMonth}>
                    <svg viewBox="0 0 24 24" fill="none" width="18" height="18"><path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </button>
                  <button className="btn-today" onClick={handleToday}>Today</button>
                  <button className="btn-send" style={{ padding: '8px 16px', marginLeft: '12px' }} onClick={() => openAddEvent()}>+ Create</button>
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
              <button className="btn-refresh" onClick={() => calendarQuery.refetch()} id="btn-refresh-calendar">
                <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
                  <path d="M21 2v6h-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M3 12a9 9 0 0115.36-6.36L21 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M3 22v-6h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M21 12a9 9 0 01-15.36 6.36L3 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
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
                <div className="calendar-weekdays">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                    <div key={day} className="calendar-weekday">{day}</div>
                  ))}
                </div>
                <div className="calendar-grid">
                  {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                    <div key={`empty-${i}`} className="calendar-cell empty"></div>
                  ))}
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const dayNum = i + 1;
                    const dateStr = new Date(calYear, calMonth, dayNum).toISOString().split('T')[0];
                    const isToday = new Date().toISOString().split('T')[0] === dateStr;
                    
                    const dayEvents = calendarQuery.data?.items?.filter((evt: any) => {
                      const evtStartStr = evt.start?.dateTime ? new Date(evt.start.dateTime as string).toISOString().split('T')[0] : evt.start?.date;
                      return evtStartStr === dateStr;
                    }) || [];

                    return (
                      <div key={dayNum} className={`calendar-cell ${isToday ? 'today' : ''}`} onClick={() => openAddEvent(dateStr)}>
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
