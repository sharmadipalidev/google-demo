const postgres = require('postgres');
const sql = postgres('postgresql://postgres:Sr3-0gK24DhI_OQ5@localhost:5432/google-demo');
async function main() {
  await sql`UPDATE corsair_integrations SET config = ${ { a: 1 } }`;
  const res = await sql`SELECT config FROM corsair_integrations`;
  console.log(res);
  process.exit(0);
}
main();
