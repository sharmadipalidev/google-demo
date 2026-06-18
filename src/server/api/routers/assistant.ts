import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { runAssistantPrompt } from "@/server/agent";

export const assistantRouter = createTRPCRouter({
  runPrompt: protectedProcedure
    .input(
      z.object({
        prompt: z.string().trim().min(1).max(4000),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const result = await runAssistantPrompt(input.prompt, ctx.googleAccessToken);
      return result;
    }),
});
