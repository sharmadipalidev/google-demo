"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { api } from "@/trpc/react";
import { useQueryClient } from "@tanstack/react-query";
import { AssistantPanel } from "@/app/_components/assistant-panel";
import { authClient, useSession, signOut } from "@/lib/auth-client";
import { useTheme } from "next-themes";
import { Star, ShieldAlert, Trash2, Mail, Send, FileEdit, AlertTriangle, Calendar as CalendarIcon, Sparkles, Activity, Bot, Link2, Grip, Sun, Moon, Inbox } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { toast } from "sonner";
import { RecentTasks } from "./recent-tasks";
import { EmailActivityChart } from "./email-activity-chart";
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
  const { data: session } = useSession();
  const user = session?.user;
  const fullName = user?.name || "User";
  const avatarInitials = fullName.charAt(0).toUpperCase();
  const queryClient = useQueryClient();

  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [activeTab, setActiveTab] = useState<Tab>("inbox");
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [calendarDropdownOpen, setCalendarDropdownOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const [isAgentic, setIsAgentic] = useState(false);
  const [inboxCategory, setInboxCategory] = useState<"primary" | "promotions" | "social" | "updates">("primary");

  // ── Profile state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileName, setProfileName] = useState(fullName);
  const [profileEmail, setProfileEmail] = useState(user?.email || "user@example.com");
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  const handleSaveProfile = async () => {
    setIsSavingSettings(true);
    try {
      if (profileName !== fullName) {
        await authClient.updateUser({ name: profileName });
      }
      setIsEditingProfile(false);
      toast.success("Profile saved successfully.");
    } catch (e) {
      console.error(e);
      toast.error("Failed to save profile.");
    } finally {
      setIsSavingSettings(false);
    }
  };

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

  const webhookQuery = api.gmail.webhookStatus.useQuery(undefined);
  const utils = api.useUtils();

  const hasGmail = webhookQuery.data?.plugins?.includes("gmail") ?? false;
  const hasCalendar = webhookQuery.data?.plugins?.includes("googlecalendar") ?? false;

  const messagesQuery = api.gmail.listMessages.useInfiniteQuery(
    { maxResults: 15, q: searchQuery || defaultQuery || undefined },
    { 
      enabled: hasGmail && ["inbox", "starred", "sent", "spam", "trash", "overview"].includes(activeTab), 
      staleTime: 900000, 
      refetchInterval: 30000,
      getNextPageParam: (lastPage) => lastPage.nextPageToken || undefined,
    },
  );

  const labelsQuery = api.gmail.listLabels.useQuery(undefined, {
    enabled: hasGmail && activeTab === "labels",
    staleTime: 900000,
  });

  const categoryCountsQuery = api.gmail.getCategoryCounts.useQuery(undefined, {
    enabled: hasGmail && activeTab === "inbox",
    staleTime: 900000,
    refetchInterval: 5000,
  });

  
  const overviewStatsQuery = api.gmail.getOverviewStats.useQuery(undefined, {
    enabled: hasGmail && activeTab === "overview",
    staleTime: 900000,
    refetchInterval: 10000,
  });

  const draftsQuery = api.gmail.listDrafts.useQuery(
    { maxResults: 15 },
    { enabled: hasGmail && activeTab === "drafts", staleTime: 900000 },
  );

  const disconnectPlugin = api.gmail.disconnectPlugin.useMutation({
    onMutate: async (variables) => {
      await utils.gmail.webhookStatus.cancel();
      const previous = utils.gmail.webhookStatus.getData();
      if (previous) {
        utils.gmail.webhookStatus.setData(undefined, {
          ...previous,
          plugins: previous.plugins.filter((p: string) => p !== variables.plugin)
        });
      }
      return { previous };
    },
    onSuccess: () => {
      utils.gmail.webhookStatus.invalidate();
      toast.success("Disconnected successfully");
    },
    onError: (e, _, context: any) => {
      if (context?.previous) {
        utils.gmail.webhookStatus.setData(undefined, context.previous);
      }
      toast.error(`Disconnect failed: ${e.message}`);
    }
  });

  // ── Connect Modal State
  const [showConnectModal, setShowConnectModal] = useState(false);
  const pluginsKey = webhookQuery.data?.plugins?.join(",") || "";

  useEffect(() => {
    if (webhookQuery.data) {
      const hasGmail = webhookQuery.data.plugins?.includes("gmail");
      const hasCalendar = webhookQuery.data.plugins?.includes("googlecalendar");
      if (!hasGmail || !hasCalendar) {
        setShowConnectModal(true);
      } else {
        setShowConnectModal(false);
      }
    }
  }, [pluginsKey, webhookQuery.data]);

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
    const d = new Date(daysToRender[0]!);
    d.setHours(0, 0, 0, 0);
    return d.toISOString();
  }, [daysToRender]);

  const timeMax = useMemo(() => {
    if (daysToRender.length === 0) return new Date().toISOString();
    const d = new Date(daysToRender[daysToRender.length - 1]!);
    d.setHours(23, 59, 59, 999);
    return d.toISOString();
  }, [daysToRender]);

  const calendarQuery = api.calendar.listEvents.useQuery(
    { maxResults: 100, q: searchQuery || undefined, timeMin, timeMax },
    { enabled: hasCalendar && (activeTab === "calendar" || activeTab === "overview"), refetchInterval: 30000 },
  );

  const systemQuotaQuery = api.gmail.getSystemQuota.useQuery(undefined, {
    refetchInterval: 60000,
  });

  // ── Calendar Grid Logic
  const getLocalDateStr = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
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
      toast.success("Event created!");
    },
    onError: (e) => toast.error(`Failed to create event: ${e.message}`)
  });

  const updateEventMutation = api.calendar.updateEvent.useMutation({
    onSuccess: () => {
      setIsEventModalOpen(false);
      calendarQuery.refetch();
      toast.success("Event updated!");
    },
    onError: (e) => toast.error(`Failed to update event: ${e.message}`)
  });

  const deleteEventMutation = api.calendar.deleteEvent.useMutation({
    onSuccess: () => {
      setIsEventModalOpen(false);
      calendarQuery.refetch();
      toast.success("Event deleted!");
    },
    onError: (e) => toast.error(`Failed to delete event: ${e.message}`)
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
      toast.success("Email sent!");
    },
    onError: (e) => toast.error(`Send failed: ${e.message}`),
  });

  const modifyMutation = api.gmail.modifyMessage.useMutation({
    onMutate: async (variables) => {
      // Cancel outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: [['gmail', 'listMessages']] });

      // Snapshot the previous messages data
      const previousData = messagesQuery.data;

      // Optimistically update the messages query cache
      if (previousData?.pages) {
        const updatedPages = previousData.pages.map((page: any) => {
          return {
            ...page,
            messages: (page.messages || []).map((msg: any) => {
              if (msg.id !== variables.id) return msg;
              let newLabels = [...(msg.labelIds || [])];
              // Add labels
              if (variables.addLabelIds) {
                for (const lbl of variables.addLabelIds) {
                  if (!newLabels.includes(lbl)) newLabels.push(lbl);
                }
              }
              // Remove labels
              if (variables.removeLabelIds) {
                newLabels = newLabels.filter((l: string) => !variables.removeLabelIds!.includes(l));
              }
              return { ...msg, labelIds: newLabels };
            })
            // Remove from list if moved to trash/spam (user expects it to vanish)
            .filter((msg: any) => {
              if (variables.addLabelIds?.includes('TRASH') || variables.addLabelIds?.includes('SPAM')) {
                return msg.id !== variables.id;
              }
              return true;
            })
          };
        });

        // Use queryKey filter to update all matching listMessages queries
        queryClient.setQueriesData(
          { queryKey: [['gmail', 'listMessages']] },
          (old: any) => old ? { ...old, pages: updatedPages } : old
        );
      }

      return { previousData };
    },
    onSuccess: () => {
      // Background refetch to sync with server truth
      messagesQuery.refetch();
      selectedMessage.refetch();
    },
    onError: (e, _variables, context: any) => {
      // Roll back on error
      if (context?.previousData) {
        queryClient.setQueriesData(
          { queryKey: [['gmail', 'listMessages']] },
          (old: any) => old ? context.previousData : old
        );
      }
      toast.error(`Action failed: ${e.message}`);
    },
  });

  const primaryTabs: { key: Tab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { key: "overview", label: "Dashboard", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="9" rx="1"></rect><rect x="14" y="3" width="7" height="5" rx="1"></rect><rect x="14" y="12" width="7" height="9" rx="1"></rect><rect x="3" y="16" width="7" height="5" rx="1"></rect></svg> },
    { key: "inbox", label: "Inbox", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg> },
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
              {tab.badge && (
                <span style={{ background: '#e5e5e5', color: '#1a1a1a', fontSize: '10px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', letterSpacing: '0.5px' }}>
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer" style={{ marginTop: 'auto', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "8px 12px", background: "transparent", borderRadius: "var(--radius-lg)", border: "1px solid var(--border)", width: '100%' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--text-primary)', color: 'var(--bg-deep)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: '14px' }}>
              {user?.image ? <img src={user.image} alt={fullName} style={{ width: '100%', height: '100%', borderRadius: '50%' }} /> : avatarInitials}
            </div>
            <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {fullName}
            </span>
          </div>
          <button onClick={() => signOut({ fetchOptions: { onSuccess: () => { window.location.href = '/'; } }})} style={{ width: '100%', padding: '8px 12px', background: 'transparent', color: 'var(--text-primary)', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: 500, transition: 'all 0.2s', display: 'flex', justifyContent: 'flex-start', alignItems: 'center', gap: '12px' }} className="hover:bg-gray-50 dark:hover:bg-zinc-800/50 rounded-lg">
            <span style={{ display: 'flex', alignItems: 'center', opacity: 0.8 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            </span>
            Logout
          </button>
        </div>
      </aside>

      {/* ── Main Content ─────────────────────────── */}
      <main className="main-content">
        
        
                {/* ── Overview Dashboard (Image Replica) ── */}
        {activeTab === "overview" && (
          <section className="panel" id="panel-overview" style={{ padding: '32px', background: 'var(--bg-base)' }}>
            
            {/* Header */}
            <div style={{ position: 'sticky', top: '-28px', zIndex: 10, background: 'var(--bg-base)', padding: '28px 32px 0 32px', margin: '-60px -32px 0 -32px' }}>
              <div className="panel-header" style={{ marginBottom: '24px' }}>
                <h2 className="panel-title">Welcome back {fullName?.split(' ')[0] || "Taylor"}</h2>
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
              {/* Inbox Card */}
              <div 
                className="bg-bg-elevated rounded-[1.25rem] p-5 shadow-sm border border-border flex flex-col justify-between cursor-pointer hover:border-text-primary/20 transition-colors group"
                onClick={() => { setActiveTab('inbox'); setSelectedMessageId(null); }}
              >
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 flex items-center justify-center flex-shrink-0 group-hover:bg-black/10 dark:group-hover:bg-white/10 transition-colors">
                    <Mail className="w-5 h-5 text-black dark:text-white" />
                  </div>
                  <div>
                    <h4 className="text-[15px] font-semibold text-text-primary">Inbox</h4>
                    <p className="text-[13px] text-text-secondary">{overviewStatsQuery.data?.inbox?.total.toLocaleString() || "0"} Emails</p>
                  </div>
                </div>
              </div>

              {/* Sent Card */}
              <div 
                className="bg-bg-elevated rounded-[1.25rem] p-5 shadow-sm border border-border flex flex-col justify-between cursor-pointer hover:border-text-primary/20 transition-colors group"
                onClick={() => { setActiveTab('sent'); setSelectedMessageId(null); }}
              >
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 flex items-center justify-center flex-shrink-0 group-hover:bg-black/10 dark:group-hover:bg-white/10 transition-colors">
                    <Send className="w-5 h-5 text-black dark:text-white" />
                  </div>
                  <div>
                    <h4 className="text-[15px] font-semibold text-text-primary">Sent Items</h4>
                    <p className="text-[13px] text-text-secondary">{overviewStatsQuery.data?.sent?.total.toLocaleString() || "0"} Emails</p>
                  </div>
                </div>
              </div>

              {/* Drafts Card */}
              <div 
                className="bg-bg-elevated rounded-[1.25rem] p-5 shadow-sm border border-border flex flex-col justify-between cursor-pointer hover:border-text-primary/20 transition-colors group"
                onClick={() => { setActiveTab('drafts'); setSelectedMessageId(null); }}
              >
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 flex items-center justify-center flex-shrink-0 group-hover:bg-black/10 dark:group-hover:bg-white/10 transition-colors">
                    <FileEdit className="w-5 h-5 text-black dark:text-white" />
                  </div>
                  <div>
                    <h4 className="text-[15px] font-semibold text-text-primary">Drafts</h4>
                    <p className="text-[13px] text-text-secondary">{overviewStatsQuery.data?.drafts?.total.toLocaleString() || "0"} Saved</p>
                  </div>
                </div>
              </div>

              {/* Starred Card */}
              <div 
                className="bg-bg-elevated rounded-[1.25rem] p-5 shadow-sm border border-border flex flex-col justify-between cursor-pointer hover:border-text-primary/20 transition-colors group"
                onClick={() => { setActiveTab('starred'); setSelectedMessageId(null); }}
              >
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 flex items-center justify-center flex-shrink-0 group-hover:bg-black/10 dark:group-hover:bg-white/10 transition-colors">
                    <Star className="w-5 h-5 text-black dark:text-white" />
                  </div>
                  <div>
                    <h4 className="text-[15px] font-semibold text-text-primary">Starred</h4>
                    <p className="text-[13px] text-text-secondary">{overviewStatsQuery.data?.starred?.total?.toLocaleString() || "0"} Emails</p>
                  </div>
                </div>
              </div>
            </div>
            {/* Middle Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              
              {/* Activity Chart */}
              <div className="bg-bg-elevated rounded-[1.25rem] p-6 shadow-sm border border-border flex flex-col relative">
                
                <EmailActivityChart />
              </div>

              {/* Daily Events */}
              <div className="bg-bg-elevated rounded-[1.25rem] p-6 shadow-sm border border-border flex flex-col">
                <h3 className="text-lg font-semibold text-text-primary mb-6">Daily Events</h3>
                <div className="space-y-4 flex-1 overflow-y-auto pr-2 min-h-0" style={{ maxHeight: '350px' }}>
                  {(() => {
                    if (!calendarQuery.data?.items) {
                      return <div className="text-sm text-text-secondary text-center py-4">Loading agenda...</div>;
                    }
                    
                    const now = new Date();
                    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
                    
                    const events = calendarQuery.data.items.filter((event: any) => {
                      const start = event.start?.dateTime || event.start?.date;
                      if (!start) return false;
                      const startDate = new Date(start);
                      const isToday = startDate.getDate() === now.getDate() && startDate.getMonth() === now.getMonth() && startDate.getFullYear() === now.getFullYear();
                      const isUpcoming = startDate > now && startDate <= nextWeek;
                      return isToday || isUpcoming;
                    }).sort((a: any, b: any) => {
                      const dA = new Date(a.start?.dateTime || a.start?.date).getTime();
                      const dB = new Date(b.start?.dateTime || b.start?.date).getTime();
                      return dA - dB;
                    });

                    if (events.length === 0) {
                      return <div className="text-sm text-text-secondary py-4 text-center">No upcoming events this week.</div>;
                    }

                    return events.map((event: any, i: number) => {
                      const colors = ['bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-black dark:text-white'];
                      const c = colors[0];
                      
                      const start = event.start?.dateTime || event.start?.date;
                      const startDate = new Date(start);
                      const isToday = startDate.getDate() === now.getDate() && startDate.getMonth() === now.getMonth() && startDate.getFullYear() === now.getFullYear();
                      
                      const dateStr = formatExactDate(startDate);
                      const colorClass = isToday ? "text-emerald-600 dark:text-[#86efac]" : "text-purple-600 dark:text-[#d8b4fe]";
                      
                      return (
                        <div key={i} className="flex items-center gap-4 group cursor-pointer p-1">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${c}`}>
                            <CalendarIcon className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-semibold text-text-primary truncate">{event.summary || "Busy"}</h4>
                            <p className="text-xs text-text-secondary truncate mt-0.5">Event - Google Calendar</p>
                          </div>
                          {dateStr && (
                            <div className="flex flex-col items-end gap-1">
                              {isToday && <span className="bg-emerald-500/10 text-emerald-600 dark:bg-[#86efac]/10 dark:text-[#86efac] px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">Today</span>}
                              <div className={`text-xs font-medium whitespace-nowrap ${colorClass}`}>
                                {dateStr}
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    });
                  })()}
                </div>
              </div>

              {/* Calendar Widget */}
              <div className="bg-bg-elevated rounded-[1.25rem] p-6 shadow-sm border border-border flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <button onClick={handlePrev} className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center hover:bg-black/10 dark:hover:bg-white/10 transition-colors text-black dark:text-white">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
                  </button>
                  <h3 className="font-semibold text-text-primary text-[15px]">{currentMonthName}, {calYear}</h3>
                  <button onClick={handleNext} className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center hover:bg-black/10 dark:hover:bg-white/10 transition-colors text-black dark:text-white">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
                  </button>
                </div>
                
                <div className="grid grid-cols-7 gap-y-4 gap-x-1 text-center mb-4">
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                    <div key={i} className="text-[13px] font-semibold text-text-primary">{day}</div>
                  ))}
                </div>
                
                <div className="grid grid-cols-7 gap-y-4 gap-x-1 text-center text-[13px] font-medium flex-1 content-start">
                  {/* Empty cells */}
                  {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                    <div key={`empty-${i}`} className="text-text-secondary opacity-30 flex items-center justify-center h-8">
                      {30 - firstDayOfMonth + i}
                    </div>
                  ))}
                  {/* Days */}
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const realToday = new Date();
                    const isToday = calYear === realToday.getFullYear() && calMonth === realToday.getMonth() && i + 1 === realToday.getDate();
                    return (
                      <div key={`day-${i}`} className="flex justify-center items-center h-8">
                        <span className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors ${isToday ? 'bg-black dark:bg-white text-white dark:text-black font-bold shadow-sm' : 'text-text-secondary hover:bg-bg-base hover:text-text-primary cursor-pointer'}`}>
                          {i + 1}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>

            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Column: Progress Rows */}
              <div className="col-span-1 lg:col-span-2">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-text-primary">System Quota</h3>
                </div>

                <div className="flex flex-col gap-4">
                  {/* Storage Progress */}
                  <div className="bg-bg-elevated rounded-[1.25rem] p-5 shadow-sm border border-border flex items-center justify-between group cursor-pointer hover:border-text-primary/20 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-[1.25rem] bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 flex items-center justify-center flex-shrink-0">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-black dark:text-white"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path></svg>
                      </div>
                      <div>
                        <h4 className="text-[15px] font-semibold text-text-primary mb-1">Drive & Email Storage</h4>
                        <div className="flex items-center gap-2">
                          <img src={user?.image || "/logo.svg"} alt="Avatar" className="w-5 h-5 rounded-full object-cover" />
                          <span className="text-xs text-text-secondary">{fullName || "User"}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-8">
                      <div className="text-right hidden sm:block">
                        <p className="text-xs text-text-secondary mb-1">Remaining</p>
                        <p className="text-sm font-semibold text-text-primary">
                          {systemQuotaQuery.data?.storageQuota ? (
                            (() => {
                              const usage = parseInt(systemQuotaQuery.data.storageQuota.usage || "0", 10);
                              const limit = parseInt(systemQuotaQuery.data.storageQuota.limit || "1", 10);
                              const remaining = Math.max(0, limit - usage);
                              return (remaining / (1024 * 1024 * 1024)).toFixed(1) + " GB";
                            })()
                          ) : "..."}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 relative flex items-center justify-center">
                          <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 48 48">
                            <circle cx="24" cy="24" r="20" fill="none" stroke="currentColor" strokeWidth="4" className="text-border" />
                            {systemQuotaQuery.data?.storageQuota && (
                              <circle cx="24" cy="24" r="20" fill="none" stroke="currentColor" strokeWidth="4" strokeDasharray="125" 
                                strokeDashoffset={(() => {
                                  const usage = parseInt(systemQuotaQuery.data.storageQuota.usage || "0", 10);
                                  const limit = parseInt(systemQuotaQuery.data.storageQuota.limit || "1", 10);
                                  const pct = usage / limit;
                                  return 125 - (125 * pct);
                                })()} 
                                className="text-text-primary transition-all duration-1000" strokeLinecap="round" />
                            )}
                          </svg>
                          <span className="text-[11px] font-semibold text-text-primary relative z-10">
                            {systemQuotaQuery.data?.storageQuota ? (
                              (() => {
                                const usage = parseInt(systemQuotaQuery.data.storageQuota.usage || "0", 10);
                                const limit = parseInt(systemQuotaQuery.data.storageQuota.limit || "1", 10);
                                return Math.round((usage / limit) * 100) + "%";
                              })()
                            ) : "..."}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Token Progress */}
                  <div className="bg-bg-elevated rounded-[1.25rem] p-5 shadow-sm border border-border flex items-center justify-between group cursor-pointer hover:border-text-primary/20 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-[1.25rem] bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 flex items-center justify-center flex-shrink-0">
                        <Activity className="w-6 h-6 text-black dark:text-white" />
                      </div>
                      <div>
                        <h4 className="text-[15px] font-semibold text-text-primary mb-1">AI Tokens Limit</h4>
                        <div className="flex items-center gap-2">
                          <img src={user?.image || "/logo.svg"} alt="Avatar" className="w-5 h-5 rounded-full object-cover" />
                          <span className="text-xs text-text-secondary">{fullName || "User"}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-8">
                      <div className="text-right hidden sm:block">
                        <p className="text-xs text-text-secondary mb-1">Remaining</p>
                        <p className="text-sm font-semibold text-text-primary">
                          {systemQuotaQuery.data?.aiTokens ? (
                            (() => {
                              const used = systemQuotaQuery.data.aiTokens.used;
                              const total = systemQuotaQuery.data.aiTokens.total;
                              const remaining = Math.max(0, total - used);
                              return (remaining >= 1000 ? (remaining / 1000).toFixed(0) + "k" : remaining);
                            })()
                          ) : "..."}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 relative flex items-center justify-center">
                          <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 48 48">
                            <circle cx="24" cy="24" r="20" fill="none" stroke="currentColor" strokeWidth="4" className="text-border" />
                            {systemQuotaQuery.data?.aiTokens && (
                              <circle cx="24" cy="24" r="20" fill="none" stroke="currentColor" strokeWidth="4" strokeDasharray="125" 
                                strokeDashoffset={(() => {
                                  const pct = systemQuotaQuery.data.aiTokens.used / systemQuotaQuery.data.aiTokens.total;
                                  return 125 - (125 * pct);
                                })()} 
                                className="text-text-primary transition-all duration-1000" strokeLinecap="round" />
                            )}
                          </svg>
                          <span className="text-[11px] font-semibold text-text-primary relative z-10">
                            {systemQuotaQuery.data?.aiTokens ? (
                              Math.round((systemQuotaQuery.data.aiTokens.used / systemQuotaQuery.data.aiTokens.total) * 100) + "%"
                            ) : "..."}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Assignments -> Recent Urgent */}
              <RecentTasks />

            </div>
          </section>
        )}


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
                <button
                  className="btn-icon"
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
                    )
                  })}
                </div>
              )}
            </div>

            {messagesQuery.isLoading && <div className="loading-state"><div className="spinner" /><span>Fetching messages…</span></div>}
            {messagesQuery.error && <div className="error-state">⚠️ {messagesQuery.error.message}</div>}

            {!selectedMessageId && messagesQuery.data?.pages && (
              <ul className="message-list">
                {messagesQuery.data.pages.flatMap(page => page.messages || []).map((msg) => {
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

                      </div>
                    </li>
                  )
                })}
                {messagesQuery.hasNextPage && (
                  <div
                    ref={(node) => {
                      if (!node) return;
                      const observer = new IntersectionObserver(entries => {
                        if (entries[0].isIntersecting && !messagesQuery.isFetchingNextPage) {
                          messagesQuery.fetchNextPage();
                        }
                      }, { rootMargin: '100px' });
                      observer.observe(node);
                      return () => observer.disconnect();
                    }}
                    style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)' }}
                  >
                    {messagesQuery.isFetchingNextPage ? 'Loading more...' : ''}
                  </div>
                )}
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
                      style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg-elevated)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', transition: 'background 0.2s' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-deep)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'var(--bg-elevated)'}
                    >
                      <Star className="w-4 h-4" fill={selectedMessage.data?.labelIds?.includes('STARRED') ? "currentColor" : "none"} />
                      {selectedMessage.data?.labelIds?.includes('STARRED') ? 'Unstar' : 'Star'}
                    </button>
                    <button
                      onClick={() => { modifyMutation.mutate({ id: selectedMessageId, addLabelIds: ['SPAM'], removeLabelIds: ['INBOX'] }); setSelectedMessageId(null); }}
                      disabled={modifyMutation.isPending}
                      style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg-elevated)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', transition: 'background 0.2s' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-deep)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'var(--bg-elevated)'}
                    >
                      <ShieldAlert className="w-4 h-4" />
                      Spam
                    </button>
                    <button
                      onClick={() => { modifyMutation.mutate({ id: selectedMessageId, addLabelIds: ['TRASH'], removeLabelIds: ['INBOX'] }); setSelectedMessageId(null); }}
                      disabled={modifyMutation.isPending}
                      style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg-elevated)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 500, color: '#ef4444', transition: 'background 0.2s' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#fef2f2'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'var(--bg-elevated)'}
                    >
                      <Trash2 className="w-4 h-4" />
                      Trash
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

                </div>
              </div>
            )}

            {!messagesQuery.isLoading && !messagesQuery.error && (!messagesQuery.data?.pages || messagesQuery.data.pages[0]?.messages?.length === 0) && (
              <div className="empty-state">
                <Inbox size={48} className="empty-icon" style={{ strokeWidth: 1.5, color: 'var(--text-secondary)' }} />
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
                  {calendarView === "week" && daysToRender[0] && `${monthNames[daysToRender[0].getMonth()]} ${daysToRender[0].getFullYear()}`}
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
                  <div style={{ position: 'relative', marginLeft: '12px' }}>
                    <button
                      onClick={() => setCalendarDropdownOpen(!calendarDropdownOpen)}
                      style={{ padding: '6px 16px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-primary)', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', minWidth: '100px', justifyContent: 'space-between', boxShadow: 'var(--shadow-sm)' }}
                    >
                      {calendarView.charAt(0).toUpperCase() + calendarView.slice(1)}
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-secondary)' }}><path d="M6 9l6 6 6-6" /></svg>
                    </button>
                    {calendarDropdownOpen && (
                      <>
                        <div style={{ position: 'fixed', inset: 0, zIndex: 40 }} onClick={() => setCalendarDropdownOpen(false)}></div>
                        <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: '4px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '8px', padding: '4px', display: 'flex', flexDirection: 'column', gap: '2px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 50, minWidth: '100%' }}>
                          {['month', 'week', 'day'].map(view => (
                            <button
                              key={view}
                              onClick={() => { setCalendarView(view as any); setCalendarDropdownOpen(false); }}
                              style={{ padding: '6px 12px', background: calendarView === view ? 'var(--bg-card)' : 'transparent', border: 'none', borderRadius: '4px', textAlign: 'left', cursor: 'pointer', color: 'var(--text-primary)', fontSize: '13px', fontWeight: 500, transition: 'background 0.2s' }}
                              onMouseOver={(e) => { if (calendarView !== view) e.currentTarget.style.background = 'var(--bg-deep)' }}
                              onMouseOut={(e) => { if (calendarView !== view) e.currentTarget.style.background = 'transparent' }}
                            >
                              {view.charAt(0).toUpperCase() + view.slice(1)}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                  <button style={{ padding: '6px 16px', marginLeft: '12px', background: '#ffffff', color: '#1a1a1a', border: '1px solid var(--border)', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s', boxShadow: 'var(--shadow-sm)' }} onClick={() => openAddEvent()} onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)'; }} onMouseOut={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14" /></svg>
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
                  <svg viewBox="0 0 24 24" fill="none" width="18" height="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" /></svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" width="18" height="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
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
                        const dateStr = getLocalDateStr(dateObj);
                        const dayNum = dateObj.getDate();
                        const isToday = getLocalDateStr(new Date()) === dateStr;

                        const dayEvents = calendarQuery.data?.items?.filter((evt: any) => {
                          const evtStartStr = evt.start?.dateTime ? getLocalDateStr(new Date(evt.start.dateTime as string)) : evt.start?.date;
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
                          const dateStr = getLocalDateStr(dateObj);
                          const dayNum = dateObj.getDate();
                          const isToday = getLocalDateStr(new Date()) === dateStr;
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
                            const dateStr = getLocalDateStr(dateObj);
                            const dayEvents = calendarQuery.data?.items?.filter((evt: any) => {
                              const evtStartStr = evt.start?.dateTime ? getLocalDateStr(new Date(evt.start.dateTime as string)) : evt.start?.date;
                              return evtStartStr === dateStr;
                            }) || [];

                            const isToday = getLocalDateStr(new Date()) === dateStr;

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
                                    return `${hours}:${mins < 10 ? '0' + mins : mins}${ampm}`;
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
                    <span className="detail-key">User ID</span>
                    <code className="detail-value">{webhookQuery.data.userId}</code>
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
          <section className="panel" id="panel-assistant" style={{ padding: 0, overflow: 'hidden', margin: '-28px -32px 0 -32px' }}>
            <AssistantPanel userInitial={avatarInitials} />
          </section>
        )}

        {/* ── Settings ────────────────────────────── */}
        {activeTab === "settings" && (
          <section className="panel" id="panel-settings">
            <div className="panel-header">
              <h2 className="panel-title">Settings</h2>
            </div>
            <div style={{ padding: '0 24px 24px', margin: '0', display: 'flex', flexDirection: 'column', gap: '24px' }}>

              {/* Profile Section */}
              <div style={{ background: 'var(--bg-elevated)', borderRadius: '12px', border: '1px solid var(--border)', padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '16px', fontWeight: 600 }}>Profile</h3>
                  <button onClick={() => setIsEditingProfile(!isEditingProfile)} style={{ background: 'transparent', border: '1px solid var(--border)', padding: '6px 12px', borderRadius: '6px', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '13px', fontWeight: 500 }}>
                    {isEditingProfile ? "Cancel" : "Edit"}
                  </button>
                </div>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '13px' }}>Manage your public profile and personal details.</p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '400px' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '8px', display: 'block' }}>Display Name</label>
                    <input type="text" value={profileName} onChange={(e) => setProfileName(e.target.value)} disabled={!isEditingProfile} style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: isEditingProfile ? 'var(--bg-card)' : 'var(--bg-deep)', color: isEditingProfile ? 'var(--text-primary)' : 'var(--text-secondary)', width: '100%', outline: 'none' }} />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '8px', display: 'block' }}>Email Address</label>
                    <input type="email" value={profileEmail} disabled style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-deep)', color: 'var(--text-secondary)', width: '100%', outline: 'none', cursor: 'not-allowed' }} />
                  </div>
                  {isEditingProfile && (
                    <button onClick={handleSaveProfile} disabled={isSavingSettings} style={{ background: 'var(--text-primary)', color: 'var(--bg-deep)', padding: '8px 16px', borderRadius: '8px', border: 'none', fontWeight: 600, cursor: isSavingSettings ? 'not-allowed' : 'pointer', fontSize: '13px', alignSelf: 'flex-start', opacity: isSavingSettings ? 0.7 : 1 }}>
                      {isSavingSettings ? "Saving..." : "Save Profile"}
                    </button>
                  )}
                </div>
              </div>

              {/* Connected Accounts Section (Corsair) */}
              <div style={{ background: 'var(--bg-elevated)', borderRadius: '12px', border: '1px solid var(--border)', padding: '24px' }}>
                <h3 style={{ marginBottom: '8px', color: 'var(--text-primary)', fontSize: '16px', fontWeight: 600 }}>Connected Accounts</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '13px' }}>Connect your Google accounts to enable Gmail and Calendar integrations via Neurosync.</p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {/* Gmail */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'var(--bg-card)', borderRadius: '10px', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div className="w-10 h-10 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 flex items-center justify-center flex-shrink-0">
                        <Mail className="w-5 h-5 text-black dark:text-white" />
                      </div>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>Gmail</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Read, send, and manage your emails</div>
                      </div>
                    </div>
                    {webhookQuery.data?.plugins?.includes("gmail") ? (
                      <button onClick={() => disconnectPlugin.mutate({ plugin: "gmail" })} disabled={disconnectPlugin.isPending} style={{ color: '#ef4444', fontWeight: 600, fontSize: '13px', padding: '8px 20px', border: '1px solid #ef4444', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.1)', cursor: 'pointer', transition: 'all 0.2s', opacity: disconnectPlugin.isPending ? 0.5 : 1 }}>
                        {disconnectPlugin.isPending ? "Disconnecting..." : "Disconnect"}
                      </button>
                    ) : (
                      <a href="/api/connect?plugin=gmail" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', justifyContent: 'center', color: 'var(--text-primary)', fontWeight: 600, fontSize: '13px', padding: '8px 20px', border: '1px solid var(--border)', borderRadius: '8px', background: 'transparent', cursor: 'pointer', transition: 'all 0.2s', textDecoration: 'none' }} className="hover:bg-gray-50 dark:hover:bg-zinc-800/50">
                        <Link2 size={16} />
                        Connect Gmail
                      </a>
                    )}
                  </div>

                  {/* Google Calendar */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'var(--bg-card)', borderRadius: '10px', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div className="w-10 h-10 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 flex items-center justify-center flex-shrink-0">
                        <CalendarIcon className="w-5 h-5 text-black dark:text-white" />
                      </div>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>Google Calendar</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>View, create, and manage your events</div>
                      </div>
                    </div>
                    {webhookQuery.data?.plugins?.includes("googlecalendar") ? (
                      <button onClick={() => disconnectPlugin.mutate({ plugin: "googlecalendar" })} disabled={disconnectPlugin.isPending} style={{ color: '#ef4444', fontWeight: 600, fontSize: '13px', padding: '8px 20px', border: '1px solid #ef4444', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.1)', cursor: 'pointer', transition: 'all 0.2s', opacity: disconnectPlugin.isPending ? 0.5 : 1 }}>
                        {disconnectPlugin.isPending ? "Disconnecting..." : "Disconnect"}
                      </button>
                    ) : (
                      <a href="/api/connect?plugin=googlecalendar" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', justifyContent: 'center', color: 'var(--text-primary)', fontWeight: 600, fontSize: '13px', padding: '8px 20px', border: '1px solid var(--border)', borderRadius: '8px', background: 'transparent', cursor: 'pointer', transition: 'all 0.2s', textDecoration: 'none' }} className="hover:bg-gray-50 dark:hover:bg-zinc-800/50">
                        <Link2 size={16} />
                        Connect Calendar
                      </a>
                    )}
                  </div>
                </div>

                <p style={{ color: 'var(--text-secondary)', fontSize: '12px', marginTop: '16px', lineHeight: '1.5' }}>
                  🔒 Powered by <strong>Neurosync</strong> — your credentials are encrypted and stored securely. Tokens are auto-refreshed.
                </p>
              </div>
              <div style={{ background: 'var(--bg-elevated)', borderRadius: '12px', border: '1px solid var(--border)', padding: '24px' }}>
                <h3 style={{ marginBottom: '8px', color: 'var(--text-primary)', fontSize: '16px', fontWeight: 600 }}>Preferences</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '13px' }}>Customize your app experience.</p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>Dark Mode</div>
                      <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Toggle the appearance of the app</div>
                    </div>
                    <button
                      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                      style={{
                        position: 'relative', width: '44px', height: '24px', borderRadius: '12px',
                        background: theme === 'dark' ? 'var(--text-primary)' : '#e5e5e5', border: 'none', cursor: 'pointer', transition: 'all 0.2s'
                      }}
                    >
                      <div style={{
                        position: 'absolute', top: '2px', left: theme === 'dark' ? '22px' : '2px',
                        width: '20px', height: '20px', borderRadius: '50%', background: 'var(--bg-deep)',
                        transition: 'all 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                      }} />
                    </button>
                  </div>

                  <div style={{ height: '1px', background: 'var(--border)' }}></div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>Email Notifications</div>
                      <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Receive daily summaries of your inbox</div>
                    </div>
                    <button
                      style={{
                        position: 'relative', width: '44px', height: '24px', borderRadius: '12px',
                        background: 'var(--text-primary)', border: 'none', cursor: 'pointer', transition: 'all 0.2s'
                      }}
                    >
                      <div style={{
                        position: 'absolute', top: '2px', left: '22px',
                        width: '20px', height: '20px', borderRadius: '50%', background: 'var(--bg-deep)',
                        transition: 'all 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                      }} />
                    </button>
                  </div>
                </div>
              </div>

              {/* AI Assistant Section */}
              <div style={{ background: 'var(--bg-elevated)', borderRadius: '12px', border: '1px solid var(--border)', padding: '24px' }}>
                <h3 style={{ marginBottom: '8px', color: 'var(--text-primary)', fontSize: '16px', fontWeight: 600 }}>AI Assistant</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '13px' }}>Configure how your AI agent behaves.</p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '400px' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '8px', display: 'block' }}>Default Action</label>
                    <Select defaultValue="draft">
                      <SelectTrigger className="w-full bg-[var(--bg-card)] border-[var(--border)] text-[var(--text-primary)]">
                        <SelectValue placeholder="Select an action" />
                      </SelectTrigger>
                      <SelectContent className="bg-[var(--bg-card)] border-[var(--border)]">
                        <SelectItem value="draft" className="text-[var(--text-primary)] focus:bg-[var(--bg-elevated)] cursor-pointer">Draft replies automatically</SelectItem>
                        <SelectItem value="ask" className="text-[var(--text-primary)] focus:bg-[var(--bg-elevated)] cursor-pointer">Ask for permission first</SelectItem>
                        <SelectItem value="read" className="text-[var(--text-primary)] focus:bg-[var(--bg-elevated)] cursor-pointer">Only read emails</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>



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
                <input type="text" value={editingEventData.summary} onChange={e => setEditingEventData({ ...editingEventData, summary: e.target.value })} required autoFocus placeholder="Add title" />
              </div>
              <div className="form-row" style={{ display: 'flex', gap: '16px' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Start Time</label>
                  <DateTimePicker 
                    value={editingEventData.start} 
                    onChange={val => setEditingEventData({ ...editingEventData, start: val })} 
                  />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>End Time</label>
                  <DateTimePicker 
                    value={editingEventData.end} 
                    onChange={val => setEditingEventData({ ...editingEventData, end: val })} 
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea rows={3} value={editingEventData.description} onChange={e => setEditingEventData({ ...editingEventData, description: e.target.value })} placeholder="Add description" />
              </div>
              <div className="form-group">
                <label>Color</label>
                <div className="color-picker">
                  {["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"].map(c => (
                    <button key={c} type="button" className={`color-swatch color-${c} ${editingEventData.colorId === c ? 'selected' : ''}`} onClick={() => setEditingEventData({ ...editingEventData, colorId: c })} />
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

      {/* ── Connect Modal ────────────────────────────── */}
      {showConnectModal && (
        <div className="modal-overlay" onClick={() => setShowConnectModal(false)} style={{ zIndex: 9999 }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px', padding: '32px' }}>
            <button 
              onClick={() => setShowConnectModal(false)}
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"></path></svg>
            </button>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>Connect Accounts</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>To use the dashboard, please connect your Google accounts.</p>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {!webhookQuery.data?.plugins?.includes("gmail") && (
                <a
                  href="/api/connect?plugin=gmail"
                  style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '12px', textDecoration: 'none', color: 'var(--text-primary)', fontWeight: 500, transition: 'all 0.2s' }}
                  className="hover:border-black/20 dark:hover:border-white/20 hover:shadow-sm"
                >
                  <div className="w-10 h-10 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 flex items-center justify-center flex-shrink-0 transition-colors group-hover:bg-black/10 dark:group-hover:bg-white/10">
                    <Mail className="w-5 h-5 text-[#1a1a1a] dark:text-white" />
                  </div>
                  Connect Gmail
                </a>
              )}
              
              {!webhookQuery.data?.plugins?.includes("googlecalendar") && (
                <a
                  href="/api/connect?plugin=googlecalendar"
                  style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '12px', textDecoration: 'none', color: 'var(--text-primary)', fontWeight: 500, transition: 'all 0.2s' }}
                  className="hover:border-black/20 dark:hover:border-white/20 hover:shadow-sm"
                >
                  <div className="w-10 h-10 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 flex items-center justify-center flex-shrink-0 transition-colors group-hover:bg-black/10 dark:group-hover:bg-white/10">
                    <CalendarIcon className="w-5 h-5 text-[#1a1a1a] dark:text-white" />
                  </div>
                  Connect Calendar
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
