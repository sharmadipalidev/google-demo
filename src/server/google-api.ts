/**
 * Lightweight Google API client using direct REST calls.
 * Uses the logged-in user's OAuth access token from Clerk.
 */

const GMAIL_BASE = "https://gmail.googleapis.com/gmail/v1/users/me";
const CALENDAR_BASE = "https://www.googleapis.com/calendar/v3";

// ─── Helpers ──────────────────────────────────────────────

async function googleFetch<T>(
  token: string,
  url: string,
  options: RequestInit = {},
): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(
      `Google API error ${res.status}: ${res.statusText} — ${body}`,
    );
  }

  // 204 No Content (e.g. delete operations)
  if (res.status === 204) return {} as T;

  return res.json() as Promise<T>;
}

function qs(params: Record<string, string | number | boolean | undefined | null>): string {
  const entries = Object.entries(params).filter(
    ([, v]) => v !== undefined && v !== null && v !== "",
  );
  if (entries.length === 0) return "";
  return "?" + new URLSearchParams(entries.map(([k, v]) => [k, String(v)])).toString();
}

// ─── Gmail Types ──────────────────────────────────────────

export interface GmailMessage {
  id?: string;
  threadId?: string;
  snippet?: string;
  internalDate?: string;
  labelIds?: string[];
  payload?: {
    headers?: Array<{ name?: string; value?: string }>;
    mimeType?: string;
    body?: { data?: string; size?: number };
    parts?: any[];
  };
}

export interface GmailListResponse {
  messages?: GmailMessage[];
  nextPageToken?: string;
  resultSizeEstimate?: number;
}

export interface GmailLabel {
  id?: string;
  name?: string;
  type?: string;
  messagesTotal?: number;
  messagesUnread?: number;
  threadsTotal?: number;
  threadsUnread?: number;
  color?: { textColor?: string; backgroundColor?: string };
}

export interface GmailDraft {
  id?: string;
  message?: GmailMessage;
}

// ─── Gmail API ────────────────────────────────────────────

export async function gmailListMessages(
  token: string,
  params: { maxResults?: number; q?: string; pageToken?: string },
): Promise<GmailListResponse> {
  const url = `${GMAIL_BASE}/messages${qs(params)}`;
  return googleFetch<GmailListResponse>(token, url);
}

export async function gmailGetMessage(
  token: string,
  params: { id: string; format?: string },
): Promise<GmailMessage> {
  const { id, format = "full" } = params;
  const url = `${GMAIL_BASE}/messages/${id}${qs({ format })}`;
  return googleFetch<GmailMessage>(token, url);
}

export async function gmailListLabels(
  token: string,
): Promise<{ labels?: GmailLabel[] }> {
  const url = `${GMAIL_BASE}/labels`;
  return googleFetch<{ labels?: GmailLabel[] }>(token, url);
}

export async function gmailGetLabel(
  token: string,
  params: { id: string },
): Promise<GmailLabel> {
  const url = `${GMAIL_BASE}/labels/${params.id}`;
  return googleFetch<GmailLabel>(token, url);
}

export async function gmailListDrafts(
  token: string,
  params: { maxResults?: number },
): Promise<{ drafts?: GmailDraft[]; nextPageToken?: string }> {
  const url = `${GMAIL_BASE}/drafts${qs(params)}`;
  return googleFetch<{ drafts?: GmailDraft[]; nextPageToken?: string }>(token, url);
}

export async function gmailSendMessage(
  token: string,
  params: { raw: string },
): Promise<GmailMessage> {
  const url = `${GMAIL_BASE}/messages/send`;
  return googleFetch<GmailMessage>(token, url, {
    method: "POST",
    body: JSON.stringify({ raw: params.raw }),
  });
}

export async function gmailModifyMessage(
  token: string,
  params: { id: string; addLabelIds?: string[]; removeLabelIds?: string[] },
): Promise<GmailMessage> {
  const { id, ...body } = params;
  const url = `${GMAIL_BASE}/messages/${id}/modify`;
  return googleFetch<GmailMessage>(token, url, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

// ─── Calendar Types ───────────────────────────────────────

export interface CalendarEvent {
  id?: string;
  summary?: string;
  description?: string;
  start?: { dateTime?: string; date?: string; timeZone?: string };
  end?: { dateTime?: string; date?: string; timeZone?: string };
  colorId?: string;
  hangoutLink?: string;
  htmlLink?: string;
  attendees?: Array<{ email: string }>;
  conferenceData?: any;
  [key: string]: any;
}

export interface CalendarListResponse {
  items?: CalendarEvent[];
  nextPageToken?: string;
}

// ─── Calendar API ─────────────────────────────────────────

export async function calendarListEvents(
  token: string,
  params: {
    calendarId?: string;
    maxResults?: number;
    q?: string;
    pageToken?: string;
    timeMin?: string;
    timeMax?: string;
    orderBy?: string;
    singleEvents?: boolean;
  },
): Promise<CalendarListResponse> {
  const { calendarId = "primary", ...queryParams } = params;
  const url = `${CALENDAR_BASE}/calendars/${encodeURIComponent(calendarId)}/events${qs(queryParams)}`;
  return googleFetch<CalendarListResponse>(token, url);
}

export async function calendarCreateEvent(
  token: string,
  params: {
    calendarId?: string;
    conferenceDataVersion?: number;
    sendUpdates?: string;
    event: Partial<CalendarEvent>;
  },
): Promise<CalendarEvent> {
  const { calendarId = "primary", event, conferenceDataVersion, sendUpdates } = params;
  const url = `${CALENDAR_BASE}/calendars/${encodeURIComponent(calendarId)}/events${qs({ conferenceDataVersion, sendUpdates })}`;
  return googleFetch<CalendarEvent>(token, url, {
    method: "POST",
    body: JSON.stringify(event),
  });
}

export async function calendarUpdateEvent(
  token: string,
  params: {
    calendarId?: string;
    id: string;
    event: Partial<CalendarEvent>;
  },
): Promise<CalendarEvent> {
  const { calendarId = "primary", id, event } = params;
  const url = `${CALENDAR_BASE}/calendars/${encodeURIComponent(calendarId)}/events/${id}`;
  return googleFetch<CalendarEvent>(token, url, {
    method: "PUT",
    body: JSON.stringify(event),
  });
}

export async function calendarDeleteEvent(
  token: string,
  params: { calendarId?: string; id: string },
): Promise<void> {
  const { calendarId = "primary", id } = params;
  const url = `${CALENDAR_BASE}/calendars/${encodeURIComponent(calendarId)}/events/${id}`;
  await googleFetch<void>(token, url, { method: "DELETE" });
}
