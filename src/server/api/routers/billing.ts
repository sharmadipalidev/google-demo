import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { user } from "@/server/db/schema";
import { eq } from "drizzle-orm";

export const billingRouter = createTRPCRouter({
  getUserPlan: protectedProcedure.query(async ({ ctx }) => {
    const dbUser = await ctx.db
      .select({ role: user.role })
      .from(user)
      .where(eq(user.id, ctx.userId))
      .limit(1)
      .then((rows) => rows[0]);

    return {
      role: dbUser?.role ?? "user",
      plan: dbUser?.role === "admin" ? "Pro" : "Starter/Free",
    };
  }),
});
