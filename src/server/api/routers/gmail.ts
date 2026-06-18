import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import {
  gmailListMessages,
  gmailGetMessage,
  gmailListLabels,
  gmailGetLabel,
  gmailListDrafts,
  gmailSendMessage,
  gmailModifyMessage,
} from "@/server/google-api";

export const gmailRouter = createTRPCRouter({
  // List messages from Gmail
  listMessages: protectedProcedure
    .input(
      z.object({
        maxResults: z.number().min(1).max(50).optional().default(10),
        q: z.string().optional(),
        pageToken: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const token = ctx.googleAccessToken;
      const result = await gmailListMessages(token, {
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
            const fullMsg = await gmailGetMessage(token, { 
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
  getMessage: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const result = await gmailGetMessage(ctx.googleAccessToken, {
        id: input.id,
        format: "full",
      });
      return result;
    }),

  // List all labels (does not include messagesUnread)
  listLabels: protectedProcedure.query(async ({ ctx }) => {
    const result = await gmailListLabels(ctx.googleAccessToken);
    return result;
  }),

  // Get unread counts for specific inbox categories
  getCategoryCounts: protectedProcedure.query(async ({ ctx }) => {
    const token = ctx.googleAccessToken;
    const categoryIds = ["CATEGORY_PERSONAL", "CATEGORY_PROMOTIONS", "CATEGORY_SOCIAL", "CATEGORY_UPDATES"];
    const counts: Record<string, number> = {};
    
    await Promise.all(
      categoryIds.map(async (id) => {
        try {
          const label = await gmailGetLabel(token, { id });
          counts[id] = label.messagesUnread ?? 0;
        } catch (e) {
          counts[id] = 0;
        }
      })
    );
    
    return counts;
  }),

  // List drafts
  listDrafts: protectedProcedure
    .input(
      z.object({
        maxResults: z.number().min(1).max(50).optional().default(10),
      })
    )
    .query(async ({ ctx, input }) => {
      const result = await gmailListDrafts(ctx.googleAccessToken, {
        maxResults: input.maxResults,
      });
      return result;
    }),

  // Send an email
  sendEmail: protectedProcedure
    .input(
      z.object({
        to: z.string().email(),
        subject: z.string(),
        body: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
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

      const result = await gmailSendMessage(ctx.googleAccessToken, { raw });
      return result;
    }),

  // Modify message labels (Star, Trash, Spam, etc.)
  modifyMessage: protectedProcedure
    .input(z.object({ 
      id: z.string(), 
      addLabelIds: z.array(z.string()).optional(), 
      removeLabelIds: z.array(z.string()).optional() 
    }))
    .mutation(async ({ ctx, input }) => {
      const result = await gmailModifyMessage(ctx.googleAccessToken, {
        id: input.id,
        addLabelIds: input.addLabelIds,
        removeLabelIds: input.removeLabelIds,
      });
      return result;
    }),

  // Webhook health check
  webhookStatus: protectedProcedure.query(async ({ ctx }) => {
    return {
      status: "active",
      endpoint: "/api/webhooks",
      userId: ctx.userId,
      plugins: ["gmail", "googlecalendar"],
      timestamp: new Date().toISOString(),
    };
  }),
});
