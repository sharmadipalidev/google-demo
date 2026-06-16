import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { corsair } from "@/server/corsair";

const tenant = corsair;

export const calendarRouter = createTRPCRouter({
  // List events from Google Calendar
  listEvents: publicProcedure
    .input(
      z.object({
        maxResults: z.number().min(1).max(2500).optional().default(100),
        q: z.string().optional(),
        pageToken: z.string().optional(),
        timeMin: z.string().optional(),
        timeMax: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      try {
        const result = await tenant.googlecalendar.api.events.getMany({
          calendarId: 'primary',
          maxResults: input.maxResults,
          q: input.q,
          pageToken: input.pageToken,
          timeMin: input.timeMin,
          timeMax: input.timeMax,
          orderBy: 'startTime',
          singleEvents: true,
        });

        return { items: result.items || [], authError: null };
      } catch (e: any) {
        return { items: [], authError: e.message };
      }
    }),

  // Create a new event in Google Calendar
  createEvent: publicProcedure
    .input(
      z.object({
        summary: z.string(),
        description: z.string().optional(),
        start: z.string(),
        end: z.string(),
        colorId: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const result = await tenant.googlecalendar.api.events.create({
          calendarId: 'primary',
          event: {
            summary: input.summary,
            description: input.description,
            start: { dateTime: input.start },
            end: { dateTime: input.end },
            colorId: input.colorId,
          }
        });
        return result;
      } catch (e: any) {
        throw new Error(`Failed to create event: ${e.message}`);
      }
    }),

  // Update an existing event in Google Calendar
  updateEvent: publicProcedure
    .input(
      z.object({
        id: z.string(),
        summary: z.string(),
        description: z.string().optional(),
        start: z.string(),
        end: z.string(),
        colorId: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const result = await tenant.googlecalendar.api.events.update({
          calendarId: 'primary',
          id: input.id,
          event: {
            summary: input.summary,
            description: input.description,
            start: { dateTime: input.start },
            end: { dateTime: input.end },
            colorId: input.colorId,
          }
        });
        return result;
      } catch (e: any) {
        throw new Error(`Failed to update event: ${e.message}`);
      }
    }),

  // Delete an event in Google Calendar
  deleteEvent: publicProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        await tenant.googlecalendar.api.events.delete({
          calendarId: 'primary',
          id: input.id,
        });
        return { success: true };
      } catch (e: any) {
        console.error("Delete event failed:", e);
        try {
          require("fs").appendFileSync(
            "delete_errors.log", 
            `[${new Date().toISOString()}] Failed to delete ID "${input.id}": ${e.message} | Response: ${JSON.stringify(e.response?.data)}\n`
          );
        } catch (err) {}
        
        // If it's a Bad Request, it might be an invalid ID or an already deleted event.
        // Let's just return success so the UI moves on, but ideally we find the root cause.
        // Actually, no, if we return success, it stays on the calendar.
        const details = e.response?.data ? JSON.stringify(e.response.data) : (e.cause ? JSON.stringify(e.cause) : e.message);
        throw new Error(`${details}`);
      }
    }),
});
