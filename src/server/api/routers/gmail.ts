import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { corsair } from "@/server/corsair";

const tenant = corsair;

export const gmailRouter = createTRPCRouter({
  // List messages from Gmail
  listMessages: publicProcedure
    .input(
      z.object({
        maxResults: z.number().min(1).max(50).optional().default(10),
        q: z.string().optional(),
        pageToken: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const result = await tenant.gmail.api.messages.list({
        maxResults: input.maxResults,
        q: input.q,
        pageToken: input.pageToken,
      });

      if (!result.messages) return result;

      // Fetch metadata (Subject, From) for each message in the list
      const messagesWithDetails = await Promise.all(
        result.messages.map(async (msg) => {
          if (!msg.id) return msg;
          try {
            const fullMsg = await tenant.gmail.api.messages.get({ 
              id: msg.id, 
              format: "full",
            });
            return {
              ...msg,
              payload: fullMsg.payload,
              snippet: fullMsg.snippet || msg.snippet,
              internalDate: fullMsg.internalDate || msg.internalDate,
            };
          } catch (e) {
            console.error(`Failed to fetch message details for ${msg.id}`, e);
            return msg;
          }
        })
      );

      return {
        ...result,
        messages: messagesWithDetails,
      };
    }),

  // Get a single message by ID
  getMessage: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const result = await tenant.gmail.api.messages.get({
        id: input.id,
        format: "full",
      });
      return result;
    }),

  // List all labels (does not include messagesUnread)
  listLabels: publicProcedure.query(async () => {
    const result = await tenant.gmail.api.labels.list({});
    return result;
  }),

  // Get unread counts for specific inbox categories
  getCategoryCounts: publicProcedure.query(async () => {
    const categoryIds = ["CATEGORY_PERSONAL", "CATEGORY_PROMOTIONS", "CATEGORY_SOCIAL", "CATEGORY_UPDATES"];
    const counts: Record<string, number> = {};
    
    await Promise.all(
      categoryIds.map(async (id) => {
        try {
          const label = await tenant.gmail.api.labels.get({ id });
          counts[id] = label.messagesUnread ?? 0;
        } catch (e) {
          counts[id] = 0;
        }
      })
    );
    
    return counts;
  }),

  // List drafts
  listDrafts: publicProcedure
    .input(
      z.object({
        maxResults: z.number().min(1).max(50).optional().default(10),
      })
    )
    .query(async ({ input }) => {
      const result = await tenant.gmail.api.drafts.list({
        maxResults: input.maxResults,
      });
      return result;
    }),

  // Send an email
  sendEmail: publicProcedure
    .input(
      z.object({
        to: z.string().email(),
        subject: z.string(),
        body: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      // Build RFC 2822 email and base64url encode
      const email = [
        `To: ${input.to}`,
        `Subject: ${input.subject}`,
        `Content-Type: text/plain; charset="UTF-8"`,
        "",
        input.body,
      ].join("\r\n");

      const raw = Buffer.from(email)
        .toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");

      const result = await tenant.gmail.api.messages.send({ raw });
      return result;
    }),

  // Modify message labels (Star, Trash, Spam, etc.)
  modifyMessage: publicProcedure
    .input(z.object({ 
      id: z.string(), 
      addLabelIds: z.array(z.string()).optional(), 
      removeLabelIds: z.array(z.string()).optional() 
    }))
    .mutation(async ({ input }) => {
      const result = await tenant.gmail.api.messages.modify({
        id: input.id,
        addLabelIds: input.addLabelIds,
        removeLabelIds: input.removeLabelIds,
      });
      return result;
    }),

  // Webhook health check
  webhookStatus: publicProcedure.query(async () => {
    return {
      status: "active",
      endpoint: "/api/webhooks",
      tenantId: "dev",
      plugins: ["gmail", "googlecalendar"],
      timestamp: new Date().toISOString(),
    };
  }),
});
