import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/server/db";
import { env } from "@/env";
import * as schema from "@/server/db/schema";
import { setupCorsair } from "corsair";
import { corsair } from "@/server/corsair";

async function syncGoogleTokens(account: any) {
  if (account.providerId !== "google") return;

  const tenant = corsair.withTenant(account.userId);
  const tasks = [];

  if (account.accessToken) {
    tasks.push(tenant.gmail.keys.set_access_token(account.accessToken));
    tasks.push(
      tenant.googlecalendar.keys.set_access_token(account.accessToken),
    );
  }

  if (account.refreshToken) {
    tasks.push(tenant.gmail.keys.set_refresh_token(account.refreshToken));
    tasks.push(
      tenant.googlecalendar.keys.set_refresh_token(account.refreshToken),
    );
  }

  if (account.accessTokenExpiresAt) {
    const expires = account.accessTokenExpiresAt.toISOString();
    tasks.push(tenant.gmail.keys.set_expires_at(expires));
    tasks.push(tenant.googlecalendar.keys.set_expires_at(expires));
  }

  await Promise.all(tasks);
}

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
              // Ensure Corsair tenant exists before syncing tokens
              await setupCorsair(corsair, { tenantId: account.userId });
              await syncGoogleTokens(account);
              console.log("[Auth Hook] Google tokens synced for user:", account.userId);
            } catch (err) {
              console.error("[Auth Hook] Failed to sync Google tokens:", err);
            }
          }
        },
      },
      update: {
        after: async (account) => {
          if (account.providerId === "google") {
            try {
              await syncGoogleTokens(account);
            } catch (err) {
              console.error("[Auth Hook] Failed to update Google tokens:", err);
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
      prompt: "select_account consent",
      scope: [
        "https://www.googleapis.com/auth/gmail.send",
        "https://www.googleapis.com/auth/gmail.labels",
        "https://www.googleapis.com/auth/gmail.compose",
        "https://www.googleapis.com/auth/gmail.modify",
        "https://www.googleapis.com/auth/calendar",
      ],
    },
  },
  plugins: [],
});
