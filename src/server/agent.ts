import { Agent, run, tool } from "@openai/agents";
import { z } from "zod";

import { corsair } from "@/server/corsair";

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

function createAssistantAgent() {
  const sendEmail = tool({
    name: "send_email",
    description:
      "Send a Gmail message when the user clearly asks to email someone.",
    parameters: z.object({
      to: z.string().email(),
      subject: z.string().min(1),
      body: z.string().min(1),
    }),
    strict: true,
    execute: async ({ to, subject, body }) => {
      const raw = buildRawEmail({ to, subject, body });
      const result = await corsair.gmail.api.messages.send({ raw });
      return `Email sent to ${to}${result.id ? ` (message ${result.id})` : ""}.`;
    },
  });

  const createCalendarEvent = tool({
    name: "create_calendar_event",
    description:
      "Create a Google Calendar event when the user asks to add, schedule, or book time.",
    parameters: z.object({
      summary: z.string().min(1),
      description: z.string().describe("Pass an empty string if no description is provided"),
      start: z.string().min(1),
      end: z.string().min(1),
      colorId: z.string().describe("Pass an empty string if no color is provided"),
    }),
    strict: true,
    execute: async ({ summary, description, start, end, colorId }) => {
      const result = await corsair.googlecalendar.api.events.create({
        calendarId: "primary",
        event: {
          summary,
          description,
          start: { dateTime: start },
          end: { dateTime: end },
          colorId,
        },
      });

      return `Calendar event created: ${result.summary ?? summary}${result.id ? ` (event ${result.id})` : ""}.`;
    },
  });

  return new Agent({
    name: "corsair-assistant",
    instructions: [
      "You are a concise operations assistant for Gmail and Google Calendar.",
      "Use send_email when the user wants to send an email.",
      "Use create_calendar_event when the user wants to add or schedule an event.",
      "CRITICAL RULE: When the user asks to add or schedule an event, do NOT create a calendar event. Instead, you MUST use the send_email tool to email the event details to the user. You should ONLY ask the user for the event time and their email address (if not provided). Do NOT ask for the date, duration, or any other details.",
      "If required details are missing for other tasks, ask for only the missing fields.",
      "After tool use, respond with a short confirmation and no extra chatter.",
    ].join(" "),
    tools: [sendEmail, createCalendarEvent],
  });
}

export async function runAssistantPrompt(prompt: string) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error(
      "OPENAI_API_KEY is missing. Add it to .env.local before using the AI assistant.",
    );
  }

  const agent = createAssistantAgent();

  // Set the topic_id to authenticate the user's Gmail and Calendar properly
  await corsair.keys.gmail.set_topic_id("test-user");
  
  const result = await run(agent, prompt);

  return {
    output: result.finalOutput ?? "",
  };
}
