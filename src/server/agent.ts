import { Agent, run, tool } from "@openai/agents";
import { z } from "zod";

import { gmailSendMessage, calendarCreateEvent } from "@/server/google-api";

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

function createAssistantAgent(googleAccessToken: string) {
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
            const result = await gmailSendMessage(googleAccessToken, { raw });
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
            const result = await calendarCreateEvent(googleAccessToken, {
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
                    conferenceData: {
                        createRequest: {
                            requestId: Math.random().toString(36).substring(7),
                            conferenceSolutionKey: { type: "hangoutsMeet" }
                        }
                    }
                },
            });

            return `Calendar event created: ${result.summary ?? summary}${result.id ? ` (event ${result.id})` : ""}. Link: ${result.hangoutLink ?? "none"}`;
        },
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
        ].join(" "),
        tools: [sendEmail, createCalendarEvent],
    });
}

export async function runAssistantPrompt(prompt: string, googleAccessToken: string) {
    if (!process.env.OPENAI_API_KEY) {
        throw new Error(
            "OPENAI_API_KEY is missing. Add it to .env.local before using the AI assistant.",
        );
    }

    const agent = createAssistantAgent(googleAccessToken);

    const result = await run(agent, prompt);

    return {
        output: result.finalOutput ?? "",
    };
}
