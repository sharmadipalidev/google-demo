import "dotenv/config";
import { createCorsair } from "corsair";
import { gmail } from "@corsair-dev/gmail";
import { googlecalendar } from "@corsair-dev/googlecalendar";
import { conn } from "./db/index";
import { env } from "@/env";



export const corsair = createCorsair({
  plugins: [gmail(), googlecalendar()],
  database: conn,
  kek: env.CORSAIR_KEK,
  multiTenancy: true,
});
