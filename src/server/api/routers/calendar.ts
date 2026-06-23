import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

export const calendarRouter = createTRPCRouter({
  // List events from Google Calendar
  listEvents: protectedProcedure
    .input(
      z.object({
        maxResults: z.number().min(1).max(2500).optional().default(100),
        q: z.string().optional(),
        pageToken: z.string().optional(),
        timeMin: z.string().optional(),
        timeMax: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const result = await ctx.tenant.googlecalendar.api.events.getMany({
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
        console.error("[calendar.listEvents] API Error:", e);
        return { items: [], authError: e?.message || "Unknown error" };
      }
    }),

  // Create a new event in Google Calendar
  createEvent: protectedProcedure
    .input(
      z.object({
        summary: z.string(),
        description: z.string().optional(),
        start: z.string(),
        end: z.string(),
        colorId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const result = await ctx.tenant.googlecalendar.api.events.create({
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
        throw new Error(`Failed to create event: ${e?.message || 'Unknown error'}`);
      }
    }),

  // Update an existing event in Google Calendar
  updateEvent: protectedProcedure
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
    .mutation(async ({ ctx, input }) => {
      try {
        const result = await ctx.tenant.googlecalendar.api.events.update({
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
        throw new Error(`Failed to update event: ${e?.message || 'Unknown error'}`);
      }
    }),

  // Delete an event in Google Calendar
  deleteEvent: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.tenant.googlecalendar.api.events.delete({
          calendarId: 'primary',
          id: input.id,
        });
        return { success: true };
      } catch (e: any) {
        console.error("Delete event failed:", e);
        const details = e?.response?.data ? JSON.stringify(e.response.data) : (e?.cause ? JSON.stringify(e.cause) : e?.message || "Unknown error");
        throw new Error(`${details}`);
      }
    }),
});
