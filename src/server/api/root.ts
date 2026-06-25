import { postRouter } from "@/server/api/routers/post";
import { gmailRouter } from "@/server/api/routers/gmail";
import { calendarRouter } from "@/server/api/routers/calendar";
import { assistantRouter } from "@/server/api/routers/assistant";
import { billingRouter } from "@/server/api/routers/billing";
import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  post: postRouter,
  gmail: gmailRouter,
  calendar: calendarRouter,
  assistant: assistantRouter,
  billing: billingRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
