/**
 * YOU PROBABLY DON'T NEED TO EDIT THIS FILE, UNLESS:
 * 1. You want to modify request context (see Part 1).
 * 2. You want to create a new middleware or type of procedure (see Part 3).
 *
 * TL;DR - This is where all the tRPC server stuff is created and plugged in. The pieces you will
 * need to use are documented accordingly near the end.
 */
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";
import { auth } from "@clerk/nextjs/server";

import { db } from "@/server/db";
import { corsair } from "@/server/corsair";
import { setupCorsair } from "corsair";

// Cache of provisioned tenant IDs to avoid calling setupCorsair on every request
const provisionedTenants = new Set<string>();

/**
 * 1. CONTEXT
 *
 * This section defines the "contexts" that are available in the backend API.
 *
 * These allow you to access things when processing a request, like the database, the session, etc.
 *
 * This helper generates the "internals" for a tRPC context. The API handler and RSC clients each
 * wrap this and provides the required context.
 *
 * @see https://trpc.io/docs/server/context
 */
export const createTRPCContext = async (opts: { headers: Headers }) => {
  const { userId } = await auth();

  return {
    db,
    userId,
    ...opts,
  };
};

/**
 * 2. INITIALIZATION
 *
 * This is where the tRPC API is initialized, connecting the context and transformer. We also parse
 * ZodErrors so that you get typesafety on the frontend if your procedure fails due to validation
 * errors on the backend.
 */
const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

/**
 * Create a server-side caller.
 *
 * @see https://trpc.io/docs/server/server-side-calls
 */
export const createCallerFactory = t.createCallerFactory;

/**
 * 3. ROUTER & PROCEDURE (THE IMPORTANT BIT)
 *
 * These are the pieces you use to build your tRPC API. You should import these a lot in the
 * "/src/server/api/routers" directory.
 */

/**
 * This is how you create new routers and sub-routers in your tRPC API.
 *
 * @see https://trpc.io/docs/router
 */
export const createTRPCRouter = t.router;

/**
 * Middleware for timing procedure execution and adding an artificial delay in development.
 *
 * You can remove this if you don't like it, but it can help catch unwanted waterfalls by simulating
 * network latency that would occur in production but not in local development.
 */
const timingMiddleware = t.middleware(async ({ next, path }) => {
  const start = Date.now();

  if (t._config.isDev) {
    // artificial delay in dev
    const waitMs = Math.floor(Math.random() * 400) + 100;
    await new Promise((resolve) => setTimeout(resolve, waitMs));
  }

  const result = await next();

  const end = Date.now();
  console.log(`[TRPC] ${path} took ${end - start}ms to execute`);

  return result;
});

/**
 * Public (unauthenticated) procedure
 *
 * This is the base piece you use to build new queries and mutations on your tRPC API. It does not
 * guarantee that a user querying is authorized, but you can still access user session data if they
 * are logged in.
 */
export const publicProcedure = t.procedure.use(timingMiddleware);

/**
 * Middleware that enforces Clerk auth and provides a tenant-scoped Corsair client.
 *
 * Each Clerk userId becomes a Corsair tenant — giving each user isolated
 * Google credentials and API access. OAuth tokens are managed by Corsair
 * internally after the user connects via /api/connect.
 */
const authMiddleware = t.middleware(async ({ ctx, next }) => {
  if (!ctx.userId) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You must be signed in to access this resource.",
    });
  }

  // Auto-provision this tenant in Corsair if not already done.
  // setupCorsair is idempotent — creates integration + account rows if missing.
  if (!provisionedTenants.has(ctx.userId)) {
    await setupCorsair(corsair, { tenantId: ctx.userId });
    provisionedTenants.add(ctx.userId);
  }

  // Get a tenant-scoped Corsair client for this user
  const tenant = corsair.withTenant(ctx.userId);

  return next({
    ctx: {
      ...ctx,
      userId: ctx.userId,
      tenant,
    },
  });
});

/**
 * Protected procedure — requires Clerk auth + Corsair tenant provisioning.
 * Provides `ctx.tenant` (tenant-scoped Corsair client) for Gmail/Calendar API calls.
 *
 * If a user hasn't connected their Google account yet via /api/connect?plugin=gmail,
 * Corsair will return an auth-missing error. The frontend should catch this and
 * redirect the user to /api/connect?plugin=gmail to authorize.
 */
export const protectedProcedure = t.procedure
  .use(timingMiddleware)
  .use(authMiddleware);
