const postgres = require('postgres');
const sql = postgres('postgresql://postgres:Sr3-0gK24DhI_OQ5@localhost:5432/google-demo');
sql`SELECT name, config::text FROM corsair_integrations;`.then(res => {
  console.log(res);
  sql.end();
});
