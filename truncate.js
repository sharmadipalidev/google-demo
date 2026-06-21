import postgres from 'postgres';

const sql = postgres('postgresql://postgres:password@localhost:5432/google-demo');

async function main() {
  try {
    await sql`TRUNCATE TABLE "user" CASCADE;`;
    console.log('Successfully truncated local users');
  } catch (err) {
    console.error('Error truncating', err);
  } finally {
    await sql.end();
  }
}

main();
