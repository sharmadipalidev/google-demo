import "dotenv/config";
import { createCorsair } from "corsair";
import { gmail } from "@corsair-dev/gmail";
import { googlecalendar } from "@corsair-dev/googlecalendar";
import { conn } from "./db/index";
import { env } from "@/env";

console.log("CORS DB CONNECTION KEYS:", Object.keys(conn || {}));
console.log("CORSAIR INITIALIZED AT:", Date.now(), "WITH EXACT KEK:", env.CORSAIR_KEK.substring(0, 5) + "...");

export const corsair = createCorsair({
  plugins: [gmail(), googlecalendar()],
  database: conn,
  kek: env.CORSAIR_KEK,
  multiTenancy: true,
});
