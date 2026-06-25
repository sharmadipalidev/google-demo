import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { eq, and, desc, sql } from "drizzle-orm";
import { corsairAccounts, corsairIntegrations, corsairEntities } from "@/server/db/schema";

export const gmailRouter = createTRPCRouter({
  // List messages from Gmail
  listMessages: protectedProcedure
    .input(
      z.object({
        maxResults: z.number().min(1).max(50).optional().default(15),
        q: z.string().optional(),
        cursor: z.string().nullish(),
        refresh: z.boolean().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      // 1. Fetch account ID to look up cached entities
      const gmailAccount = await ctx.db
        .select({ id: corsairAccounts.id })
        .from(corsairAccounts)
        .innerJoin(corsairIntegrations, eq(corsairAccounts.integrationId, corsairIntegrations.id))
        .where(
          and(
            eq(corsairAccounts.tenantId, ctx.userId),
            eq(corsairIntegrations.name, 'gmail')
          )
        )
        .limit(1)
        .then(rows => rows[0]);

      let emails: any[] = [];
      let nextCursor: string | null = null;
      let fetchedFromGmail = false;

      let cacheLabelIds: string[] | null = null;
      if (!input.q || input.q === "in:inbox category:primary") {
        cacheLabelIds = ["INBOX"];
      } else if (input.q === "in:sent") {
        cacheLabelIds = ["SENT"];
      } else if (input.q === "in:spam") {
        cacheLabelIds = ["SPAM"];
      } else if (input.q === "in:trash") {
        cacheLabelIds = ["TRASH"];
      } else if (input.q === "is:starred") {
        cacheLabelIds = ["STARRED"];
      } else if (input.q.startsWith("in:inbox category:")) {
        const cat = input.q.split("category:")[1]?.trim();
        if (cat === "promotions") cacheLabelIds = ["INBOX", "CATEGORY_PROMOTIONS"];
        else if (cat === "social") cacheLabelIds = ["INBOX", "CATEGORY_SOCIAL"];
        else if (cat === "updates") cacheLabelIds = ["INBOX", "CATEGORY_UPDATES"];
      }

      const isDbToken = !input.cursor || input.cursor.startsWith('db_offset:');
      const shouldTryCache = isDbToken && !input.refresh && cacheLabelIds !== null;

      // 2. Try Cache
      if (shouldTryCache && gmailAccount) {
        let offset = 0;
        if (input.cursor && input.cursor.startsWith('db_offset:')) {
          offset = parseInt(input.cursor.split(':')[1] || '0', 10) || 0;
        }

        const conditions = [
          eq(corsairEntities.accountId, gmailAccount.id),
          eq(corsairEntities.entityType, 'messages'),
          sql`${corsairEntities.id} LIKE 'e_messages_%'`,
          sql`${corsairEntities.data}->'labelIds' @> ${JSON.stringify(cacheLabelIds)}::jsonb`
        ];

        try {
          const rows = await ctx.db
            .select()
            .from(corsairEntities)
            .where(and(...conditions))
            .orderBy(desc(sql`coalesce((${corsairEntities.data}->>'internalDate')::bigint, extract(epoch from ${corsairEntities.createdAt})::bigint * 1000)`))
            .limit(input.maxResults)
            .offset(offset);

          if (rows.length > 0) {
            emails = rows.map(r => r.data);
            if (rows.length === input.maxResults) {
              nextCursor = `db_offset:${offset + input.maxResults}`;
            }
            if (offset === 0 || rows.length === input.maxResults) {
              fetchedFromGmail = true;
            }
          }
        } catch (dbErr) {
          console.error("DB cache error:", dbErr);
        }
      }

      // 3. Fallback to Gmail API
      if (!fetchedFromGmail) {
        const gmailPageToken = (input.cursor && !input.cursor.startsWith('db_offset:')) ? input.cursor : undefined;
        const result = await ctx.tenant.gmail.api.messages.list({
          maxResults: input.maxResults,
          q: input.q,
          pageToken: gmailPageToken,
        });

        nextCursor = result.nextPageToken || null;

        if (result.messages) {
          emails = await Promise.all(
            result.messages.map(async (msg) => {
              if (!msg.id) return msg;
              try {
                const fullMsg = await ctx.tenant.gmail.api.messages.get({
                  id: msg.id,
                  format: "full"
                });
                return {
                  ...msg,
                  payload: fullMsg.payload,
                  snippet: fullMsg.snippet || msg.snippet,
                  internalDate: fullMsg.internalDate || msg.internalDate,
                  labelIds: fullMsg.labelIds || msg.labelIds,
                };
              } catch (e) {
                console.error(`Failed to fetch message metadata for ${msg.id}`, e);
                return msg;
              }
            })
          );

          // 4. Cache newly fetched emails
          if (gmailAccount) {
            for (const email of emails) {
              if (!email.id) continue;
              const entityRowId = `e_messages_${email.id}_a_${gmailAccount.id}`;
              await ctx.db.insert(corsairEntities).values({
                id: entityRowId,
                accountId: gmailAccount.id,
                entityId: email.id,
                entityType: 'messages',
                version: '1',
                data: email,
              }).onConflictDoUpdate({
                target: corsairEntities.id,
                set: {
                  data: sql`coalesce(${corsairEntities.data}, '{}'::jsonb) || ${JSON.stringify(email)}::jsonb`,
                  updatedAt: new Date(),
                }
              }).catch(e => console.error("Cache insert error", e));
            }
          }
        }
      }

      return {
        messages: emails,
        nextPageToken: nextCursor,
      };
    }),

  // Get a single message by ID
  getMessage: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      // 1. Try DB cache first
      const gmailAccount = await ctx.db
        .select({ id: corsairAccounts.id })
        .from(corsairAccounts)
        .innerJoin(corsairIntegrations, eq(corsairAccounts.integrationId, corsairIntegrations.id))
        .where(
          and(
            eq(corsairAccounts.tenantId, ctx.userId),
            eq(corsairIntegrations.name, 'gmail')
          )
        )
        .limit(1)
        .then(rows => rows[0]);

      if (gmailAccount) {
        const cached = await ctx.db
          .select({ data: corsairEntities.data })
          .from(corsairEntities)
          .where(
            and(
              eq(corsairEntities.accountId, gmailAccount.id),
              eq(corsairEntities.entityId, input.id),
              eq(corsairEntities.entityType, 'messages')
            )
          )
          .limit(1)
          .then(rows => rows[0]);
          
        if (cached?.data) {
          const payload = (cached.data as any).payload;
          if (payload && (payload.parts || payload.body?.data)) {
            return cached.data as any;
          }
        }
      }

      // 2. Fallback to Gmail API if not cached or partial metadata
      const result = await ctx.tenant.gmail.api.messages.get({
        id: input.id,
        format: "full",
      });

      // 3. Cache the full result
      if (gmailAccount && result) {
        const entityRowId = `e_messages_${input.id}_a_${gmailAccount.id}`;
        await ctx.db.insert(corsairEntities).values({
          id: entityRowId,
          accountId: gmailAccount.id,
          entityId: input.id,
          entityType: 'messages',
          version: '1',
          data: result,
        }).onConflictDoUpdate({
          target: corsairEntities.id,
          set: {
            data: sql`coalesce(${corsairEntities.data}, '{}'::jsonb) || ${JSON.stringify(result)}::jsonb`,
            updatedAt: new Date(),
          }
        }).catch(e => console.error("Cache insert error", e));
      }

      return result as any;
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
          maxResults: 500
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
        to: z.string().trim().email(),
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

      // Update the database cache if we successfully got new labels
      if (result.labelIds) {
        const gmailAccount = await ctx.db
          .select({ id: corsairAccounts.id })
          .from(corsairAccounts)
          .innerJoin(corsairIntegrations, eq(corsairAccounts.integrationId, corsairIntegrations.id))
          .where(
            and(
              eq(corsairAccounts.tenantId, ctx.userId),
              eq(corsairIntegrations.name, 'gmail')
            )
          )
          .limit(1)
          .then(rows => rows[0]);

        if (gmailAccount) {
          await ctx.db.update(corsairEntities)
            .set({
              data: sql`jsonb_set(coalesce("data", '{}'::jsonb), '{labelIds}', ${JSON.stringify(result.labelIds)}::jsonb, true)`,
              updatedAt: new Date()
            })
            .where(
              and(
                eq(corsairEntities.accountId, gmailAccount.id),
                eq(corsairEntities.entityId, input.id),
                eq(corsairEntities.entityType, 'messages')
              )
            ).catch(e => console.error("Cache update error", e));
        }
      }

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
