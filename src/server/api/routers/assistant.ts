import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { runAssistantPrompt } from "@/server/agent";

export const assistantRouter = createTRPCRouter({
  runPrompt: publicProcedure
    .input(
      z.object({
        prompt: z.string().trim().min(1).max(4000),
      }),
    )
    .mutation(async ({ input }) => {
      const result = await runAssistantPrompt(input.prompt);
      return result;
    }),
});
