import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { runAssistantPrompt } from "@/server/agent";

export const assistantRouter = createTRPCRouter({
  runPrompt: protectedProcedure
    .input(
      z.object({
        prompt: z.string().trim().min(1).max(4000),
        history: z.array(
          z.object({
            role: z.enum(["user", "assistant"]),
            content: z.string(),
          })
        ).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const result = await runAssistantPrompt(input.prompt, ctx.tenant, input.history);
      return result;
    }),
});
