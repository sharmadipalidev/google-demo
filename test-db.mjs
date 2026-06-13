import { createCorsair } from "corsair";
import { gmail } from "@corsair-dev/gmail";
import { config } from "dotenv";
config();
const corsair = createCorsair({ plugins: [gmail()] });
const tenant = corsair.withTenant("dev");
const res = await tenant.gmail.db.messages.list({ limit: 2 });
console.log(JSON.stringify(res, null, 2));
