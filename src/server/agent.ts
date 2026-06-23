import { Agent, run, tool } from "@openai/agents";
import { z } from "zod";

import { corsair } from "@/server/corsair";

type CorsairTenant = ReturnType<typeof corsair.withTenant>;

function buildRawEmail(input: {
    to: string;
    subject: string;
    body: string;
}): string {
    const email = [
        `To: ${input.to}`,
        `Subject: ${input.subject}`,
        'Content-Type: text/plain; charset="UTF-8"',
        "",
        input.body,
    ].join("\r\n");

    return Buffer.from(email)
        .toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");
}

function createAssistantAgent(tenant: CorsairTenant) {
    const sendEmail = tool({
        name: "send_email",
        description:
            "Send a Gmail message when the user clearly asks to email someone.",
        parameters: z.object({
            to: z.string().describe("The email address to send to"),
            subject: z.string().describe("The subject of the email"),
            body: z.string().describe("The body of the email"),
        }),
        strict: true,
        execute: async ({ to, subject, body }) => {
            const raw = buildRawEmail({ to, subject, body });
            const result = await tenant.gmail.api.messages.send({ raw });
            return `Email sent to ${to}${result.id ? ` (message ${result.id})` : ""}.`;
        },
    });

    const createCalendarEvent = tool({
        name: "create_calendar_event",
        description:
            "Create a Google Calendar event when the user asks to add, schedule, or book time.",
        parameters: z.object({
            summary: z.string().describe("The title of the event"),
            description: z.string().describe("Pass an empty string if no description is provided"),
            start: z.string().describe("Start time in ISO format (e.g., 2026-06-18T23:00:00). Do NOT append 'Z' or timezone offset."),
            end: z.string().describe("End time in ISO format (e.g., 2026-06-18T23:30:00). Do NOT append 'Z' or timezone offset."),
            colorId: z.string().describe("Pass an empty string if no color is provided"),
            attendeeEmail: z.string().describe("Optional email of the attendee to invite. Pass an empty string if no attendee."),
        }),
        strict: true,
        execute: async ({ summary, description, start, end, colorId, attendeeEmail }) => {
            const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
            const result = await tenant.googlecalendar.api.events.create({
                calendarId: "primary",
                conferenceDataVersion: 1,
                sendUpdates: "all",
                event: {
                    summary,
                    ...(description ? { description } : {}),
                    start: { dateTime: start, timeZone },
                    end: { dateTime: end, timeZone },
                    ...(colorId ? { colorId } : {}),
                    ...(attendeeEmail ? { attendees: [{ email: attendeeEmail }] } : {}),
                },
            });

            return `Calendar event created: ${result.summary ?? summary}${result.id ? ` (event ${result.id})` : ""}. Link: ${result.hangoutLink ?? "none"}`;
        },
    });

    const searchEmails = tool({
        name: "search_emails",
        description: "Search for emails in the user's Gmail account based on a query.",
        parameters: z.object({
            q: z.string().describe("The search query. Examples: 'is:unread', 'newer_than:1d', 'from:boss@example.com', 'subject:urgent'"),
            maxResults: z.number().optional().describe("Maximum number of emails to retrieve (default 10, max 20)"),
        }),
        strict: true,
        execute: async ({ q, maxResults = 10 }) => {
            try {
                const res = await tenant.gmail.api.messages.list({ q, maxResults: Math.min(maxResults, 20) });
                if (!res.messages || res.messages.length === 0) return "No emails found matching your query.";
                
                const fullMessages = await Promise.all(
                    res.messages.map(async (m) => {
                        if (!m.id) return null;
                        const msg = await tenant.gmail.api.messages.get({ id: m.id, format: "full" });
                        const subjectHeader = msg.payload?.headers?.find(h => h.name === 'Subject');
                        const fromHeader = msg.payload?.headers?.find(h => h.name === 'From');
                        let textPart = msg.payload?.parts?.find(p => p.mimeType === 'text/plain')?.body?.data;
                        if (!textPart && msg.payload?.body?.data) textPart = msg.payload.body.data;
                        
                        let decodedBody = "";
                        if (textPart) {
                            decodedBody = Buffer.from(textPart, 'base64').toString('utf-8').substring(0, 500);
                        }
                        
                        return {
                            id: msg.id,
                            subject: subjectHeader?.value || "No Subject",
                            from: fromHeader?.value || "Unknown Sender",
                            snippet: msg.snippet,
                            bodySnippet: decodedBody
                        };
                    })
                );
                
                return JSON.stringify(fullMessages.filter(Boolean));
            } catch (e: any) {
                return `Failed to search emails: ${e.message}`;
            }
        }
    });

    const getCalendarEvents = tool({
        name: "get_calendar_events",
        description: "List upcoming events from the user's Google Calendar for a specific timeframe.",
        parameters: z.object({
            timeMin: z.string().describe("Start time in ISO format (e.g., 2026-06-18T00:00:00Z)"),
            timeMax: z.string().describe("End time in ISO format (e.g., 2026-06-19T00:00:00Z)"),
        }),
        strict: true,
        execute: async ({ timeMin, timeMax }) => {
            try {
                const res = await tenant.googlecalendar.api.events.getMany({
                    calendarId: "primary",
                    timeMin,
                    timeMax,
                    singleEvents: true,
                    orderBy: "startTime"
                });
                if (!res.items || res.items.length === 0) return "No events found for this timeframe.";
                
                const events = res.items.map(e => ({
                    summary: e.summary,
                    start: e.start?.dateTime || e.start?.date,
                    end: e.end?.dateTime || e.end?.date,
                    description: e.description
                }));
                return JSON.stringify(events);
            } catch (e: any) {
                return `Failed to get calendar events: ${e.message}`;
            }
        }
    });

    const archiveEmail = tool({
        name: "archive_email",
        description: "Archive an email by removing it from the INBOX.",
        parameters: z.object({
            id: z.string().describe("The ID of the email message to archive"),
        }),
        strict: true,
        execute: async ({ id }) => {
            try {
                await tenant.gmail.api.messages.modify({
                    id,
                    removeLabelIds: ["INBOX"]
                });
                return `Email ${id} archived successfully.`;
            } catch (e: any) {
                return `Failed to archive email: ${e.message}`;
            }
        }
    });

    return new Agent({
        name: "corsair-assistant",
        instructions: [
            "You are a concise operations assistant for Gmail and Google Calendar.",
            `The current date and time is: ${new Date().toString()}. Your timezone is ${Intl.DateTimeFormat().resolvedOptions().timeZone}. Provide all dates in local time without UTC conversions.`,
            "Use send_email when the user wants to send an ordinary email.",
            "Use create_calendar_event when the user wants to add or schedule an event.",
            "CRITICAL RULE: When the user asks to add or schedule an event, you MUST ONLY ask for the event time and date. Do NOT ask for their Gmail address.",
            "Do not ask for duration or other details unless absolutely necessary. Assume an event is on their own calendar.",
            "If required details are missing for other tasks, ask for only the missing fields.",
            "After tool use, respond with a short confirmation and no extra chatter.",
            "You must only answer questions and perform tasks related to Gmail and Google Calendar. If a user asks something unrelated to emails or calendar events, politely decline and state your purpose. You should answer all tasks related to Gmail and Google Calendar.",
        ].join(" "),
        tools: [sendEmail, createCalendarEvent, searchEmails, getCalendarEvents, archiveEmail],
    });
}

export async function runAssistantPrompt(prompt: string, tenant: CorsairTenant, history?: { role: "user" | "assistant"; content: string }[]) {
    if (!process.env.OPENAI_API_KEY) {
        throw new Error(
            "OPENAI_API_KEY is missing. Add it to .env.local before using the AI assistant.",
        );
    }

    const agent = createAssistantAgent(tenant);

    const messages: any[] = [];
    if (history) {
        for (const h of history) {
            if (h.role === "user") {
                messages.push({ role: h.role, content: h.content });
            } else {
                messages.push({ role: h.role, content: [{ type: "output_text", text: h.content }] });
            }
        }
    }
    messages.push({ role: "user", content: prompt });

    const result = await run(agent, messages as any);

    return {
        output: result.finalOutput ?? "",
    };
}
