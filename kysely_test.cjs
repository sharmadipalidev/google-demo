const postgres = require('postgres');
const { Kysely, PostgresDialect } = require('kysely');
const { PostgresJSDialect } = require('kysely-postgres-js');

const sql = postgres('postgresql://postgres:Sr3-0gK24DhI_OQ5@localhost:5432/google-demo');

function K(e){return new Proxy(e,{get(n,t,r){return t!=="reserve"?Reflect.get(n,t,r).bind(n):async function(){let c=await n.reserve();return new Proxy(c,{get(o,a,f){return a!=="unsafe"?Reflect.get(o,a,f).bind(o):function(y,l,p){return o.unsafe(y,l?.map(x => typeof x === 'object' && x !== null ? JSON.stringify(x) : x),p)}}})}}})}

const db = new Kysely({ dialect: new PostgresJSDialect({ postgres: K(sql) }) });

async function main() {
  const w = { client_id: "test", client_secret: "test2" };
  await db.updateTable('corsair_integrations').set({ config: w }).where('name', '=', 'gmail').execute();
  const res = await sql`SELECT config FROM corsair_integrations WHERE name = 'gmail'`;
  console.log('Kysely result:', res);
  process.exit(0);
}
main();
