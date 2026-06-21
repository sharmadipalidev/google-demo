import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const conn = postgres("postgresql://neondb_owner:npg_Jq4bp9oilKVf@ep-damp-union-aov0jbg5-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require");
const db = drizzle(conn);

async function main() {
  const res = await conn`SELECT id, name FROM corsair_integrations`;
  console.log('Integrations:', res);
  
  await conn.end();
}
main();
