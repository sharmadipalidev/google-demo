import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/server/db";
import { env } from "@/env";
import * as schema from "@/server/db/schema";
import { setupCorsair } from "corsair";
import { corsair } from "@/server/corsair";

// NOTE: syncGoogleTokens was removed. Better Auth sign-in now only requests
// profile + email scopes. Gmail/Calendar tokens are managed entirely by
// Corsair's own OAuth flow via /api/connect?plugin=gmail|googlecalendar.



export const auth = betterAuth({
  secret:
    process.env.BETTER_AUTH_SECRET ||
    "fallback_secret_for_dev_mode_which_is_now_32_chars_long!!",
  baseURL: env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  trustedOrigins: ["http://localhost:3000", "http://localhost:3001"],
  trustHost: true,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),

  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          try {
            await setupCorsair(corsair, { tenantId: user.id });
            console.log("[Auth Hook] Corsair tenant created for user:", user.id);
          } catch (err) {
            console.error("[Auth Hook] Failed to setup Corsair tenant:", err);
          }
        },
      },
    },
    session: {
      create: {
        after: async (session) => {
          try {
            await setupCorsair(corsair, { tenantId: session.userId });
          } catch (err) {
            console.error("[Auth Hook] Failed to setup Corsair on session:", err);
          }
        },
      },
    },
    account: {
      create: {
        after: async (account) => {
          if (account.providerId === "google") {
            try {
              // Ensure Corsair tenant exists — token sync is handled by Corsair OAuth
              await setupCorsair(corsair, { tenantId: account.userId });
              console.log("[Auth Hook] Corsair tenant ensured for user:", account.userId);
            } catch (err) {
              console.error("[Auth Hook] Failed to setup Corsair tenant:", err);
            }
          }
        },
      },
    },
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      accessType: "offline",
      prompt: "select_account",
      scope: [
        "profile",
        "email",
      ],
    },
  },
  plugins: [],
});
