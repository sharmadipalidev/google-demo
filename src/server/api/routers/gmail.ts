import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { eq, and } from "drizzle-orm";
import { corsairAccounts, corsairIntegrations } from "@/server/db/schema";

export const gmailRouter = createTRPCRouter({
  // List messages from Gmail
  listMessages: protectedProcedure
    .input(
      z.object({
        maxResults: z.number().min(1).max(50).optional().default(15),
        q: z.string().optional(),
        cursor: z.string().nullish(),
      })
    )
    .query(async ({ ctx, input }) => {
      const result = await ctx.tenant.gmail.api.messages.list({
        maxResults: input.maxResults,
        q: input.q,
        pageToken: input.cursor ?? undefined,
      });

      if (!result.messages) return result;

      // Fetch only metadata (headers) for each message — NOT full body content.
      // Full content is fetched on-demand when user opens a specific message.
      const messagesWithDetails = await Promise.all(
        result.messages.map(async (msg) => {
          if (!msg.id) return msg;
          try {
            const metaMsg = await ctx.tenant.gmail.api.messages.get({
              id: msg.id,
              format: "metadata"
            });
            return {
              ...msg,
              payload: metaMsg.payload,
              snippet: metaMsg.snippet || msg.snippet,
              internalDate: metaMsg.internalDate || msg.internalDate,
              labelIds: metaMsg.labelIds || msg.labelIds,
            };
          } catch (e) {
            console.error(`Failed to fetch message metadata for ${msg.id}`, e);
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
      const result = await ctx.tenant.gmail.api.messages.get({
        id: input.id,
        format: "full",
      });
      return result;
    }),

  // List all labels
  listLabels: protectedProcedure.query(async ({ ctx }) => {
    const result = await ctx.tenant.gmail.api.labels.list({});
    return result;
  }),

  // Get unread counts for specific inbox categories
  getCategoryCounts: protectedProcedure.query(async ({ ctx }) => {
    const categoryIds = ["CATEGORY_PERSONAL", "CATEGORY_PROMOTIONS", "CATEGORY_SOCIAL", "CATEGORY_UPDATES"];
    const counts: Record<string, number> = {};
    
    await Promise.all(
      categoryIds.map(async (id) => {
        try {
          const label = await ctx.tenant.gmail.api.labels.get({ id });
          counts[id] = label.messagesUnread ?? 0;
        } catch (e) {
          counts[id] = 0;
        }
      })
    );
    
    return counts;
  }),

  // Get Overview Stats
  getOverviewStats: protectedProcedure.query(async ({ ctx }) => {
    const labelsToFetch = ["INBOX", "SENT", "DRAFT", "SPAM", "TRASH", "STARRED"];
    const stats = {
      inbox: { total: 0, unread: 0 },
      sent: { total: 0 },
      drafts: { total: 0 },
      spam: { total: 0, unread: 0 },
      trash: { total: 0 },
      starred: { total: 0 },
    };

    await Promise.all(
      labelsToFetch.map(async (labelId) => {
        try {
          const label = await ctx.tenant.gmail.api.labels.get({ id: labelId });
          const total = label.messagesTotal ?? 0;
          const unread = label.messagesUnread ?? 0;
          
          if (labelId === "INBOX") {
            stats.inbox.total = total;
            stats.inbox.unread = unread;
          } else if (labelId === "SENT") {
            stats.sent.total = total;
          } else if (labelId === "DRAFT") {
            stats.drafts.total = total;
          } else if (labelId === "SPAM") {
            stats.spam.total = total;
            stats.spam.unread = unread;
          } else if (labelId === "TRASH") {
            stats.trash.total = total;
          } else if (labelId === "STARRED") {
            stats.starred.total = total;
          }
        } catch (e) {
          console.error(`Failed to fetch label stats for ${labelId}`, e);
        }
      })
    );

    return stats;
  }),

  // Get Email Activity for the last 14 days
  getEmailActivity: protectedProcedure.query(async ({ ctx }) => {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    
    const queries = Array.from({ length: 14 }).map(async (_, i) => {
      const startOfDay = new Date(today);
      startOfDay.setDate(today.getDate() - i);
      startOfDay.setHours(0, 0, 0, 0);

      const startStr = `${startOfDay.getFullYear()}/${startOfDay.getMonth() + 1}/${startOfDay.getDate()}`;
      
      const nextDay = new Date(startOfDay);
      nextDay.setDate(startOfDay.getDate() + 1);
      const nextStr = `${nextDay.getFullYear()}/${nextDay.getMonth() + 1}/${nextDay.getDate()}`;

      try {
        const res = await ctx.tenant.gmail.api.messages.list({
          q: `after:${startStr} before:${nextStr}`,
          maxResults: 500,
          fields: 'messages(id),resultSizeEstimate'
        });
        
        return {
          date: startOfDay.toISOString(),
          count: res.messages?.length ?? res.resultSizeEstimate ?? 0
        };
      } catch (e) {
        console.error(`Failed to fetch email activity for ${startStr}`, e);
        return { date: startOfDay.toISOString(), count: 0 };
      }
    });

    const results = await Promise.all(queries);
    return results.reverse(); // return chronological
  }),

  // Get System Quota
  getSystemQuota: protectedProcedure.query(async ({ ctx }) => {
    let storageQuota = {
      limit: "16106127360", // 15 GB
      usageInDrive: "5368709120", // 5 GB
      usageInDriveTrash: "0",
      usage: "5368709120"
    };

    try {
      const auth = ctx.tenant.gmail.api.context._options.auth;
      const { google } = await import("googleapis");
      const drive = google.drive({ version: "v3", auth });
      
      const about = await drive.about.get({ fields: "storageQuota" });
      if (about.data.storageQuota) {
        storageQuota = about.data.storageQuota;
      }
    } catch (err) {
      console.error("Failed to fetch live Drive quota (mocking instead):", err);
    }

    const aiTokens = {
      used: 45000,
      total: 300000
    };

    return {
      storageQuota,
      aiTokens
    };
  }),

  // List drafts
  listDrafts: protectedProcedure
    .input(
      z.object({
        maxResults: z.number().min(1).max(50).optional().default(15),
        q: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const result = await ctx.tenant.gmail.api.drafts.list({
        maxResults: input.maxResults,
        q: input.q,
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
        threadId: z.string().optional(),
        inReplyTo: z.string().optional(),
        references: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Build RFC 2822 email and base64url encode
      const emailLines = [
        `To: ${input.to}`,
        `Subject: ${input.subject}`,
        `Content-Type: text/plain; charset="UTF-8"`,
      ];
      
      if (input.inReplyTo) {
        emailLines.push(`In-Reply-To: ${input.inReplyTo}`);
      }
      if (input.references) {
        emailLines.push(`References: ${input.references}`);
      }
      
      emailLines.push("");
      emailLines.push(input.body);

      const email = emailLines.join("\r\n");

      const raw = Buffer.from(email)
        .toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");

      const sendOptions: any = { raw };
      if (input.threadId) {
        sendOptions.threadId = input.threadId;
      }

      const result = await ctx.tenant.gmail.api.messages.send(sendOptions);
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
      const result = await ctx.tenant.gmail.api.messages.modify({
        id: input.id,
        addLabelIds: input.addLabelIds,
        removeLabelIds: input.removeLabelIds,
      });
      return result;
    }),

  // Webhook health check & connected plugins
  webhookStatus: protectedProcedure.query(async ({ ctx }) => {
    const integrations = await ctx.db
      .select({ 
        name: corsairIntegrations.name,
        config: corsairAccounts.config
      })
      .from(corsairAccounts)
      .innerJoin(
        corsairIntegrations,
        eq(corsairAccounts.integrationId, corsairIntegrations.id)
      )
      .where(eq(corsairAccounts.tenantId, ctx.userId));

    // Only include plugins that have actual credentials stored in their config
    const plugins = integrations
      .filter((i) => {
        const conf = i.config as Record<string, any> | null;
        return conf && Object.keys(conf).length > 0;
      })
      .map((i) => i.name);

    return {
      status: "active",
      endpoint: "/api/webhooks",
      userId: ctx.userId,
      plugins,
      timestamp: new Date().toISOString(),
    };
  }),

  // Disconnect a specific plugin
  disconnectPlugin: protectedProcedure
    .input(z.object({ plugin: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const integrationRow = await ctx.db
        .select({ id: corsairIntegrations.id })
        .from(corsairIntegrations)
        .where(eq(corsairIntegrations.name, input.plugin))
        .limit(1);

      if (integrationRow.length > 0) {
        await ctx.db
          .delete(corsairAccounts)
          .where(
            and(
              eq(corsairAccounts.tenantId, ctx.userId),
              eq(corsairAccounts.integrationId, integrationRow[0]?.id as string)
            )
          );
      }
      return { success: true };
    }),
});
