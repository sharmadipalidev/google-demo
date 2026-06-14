import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { corsair } from "@/server/corsair";

const tenant = corsair;

export const calendarRouter = createTRPCRouter({
  // List events from Google Calendar
  listEvents: publicProcedure
    .input(
      z.object({
        maxResults: z.number().min(1).max(50).optional().default(10),
        q: z.string().optional(),
        pageToken: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      try {
        const result = await tenant.googlecalendar.api.events.getMany({
          calendarId: 'primary',
          maxResults: input.maxResults,
          q: input.q,
          pageToken: input.pageToken,
          orderBy: 'startTime',
          singleEvents: true,
        });

        return { items: result.items || [], authError: null };
      } catch (e: any) {
        return { items: [], authError: e.message };
      }
    }),
});
