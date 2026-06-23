import { appRouter } from "./api/root.js";
import { createTRPCContext } from "./api/trpc.js";

async function run() {
  const ctx = await createTRPCContext({ headers: new Headers() });
  const caller = appRouter.createCaller(ctx);
  
  try {
    const res = await caller.calendar.listEvents({ maxResults: 100 });
    console.log("Success:", res);
  } catch (e) {
    console.error("TRPC Error:", e);
  }
}

run();
