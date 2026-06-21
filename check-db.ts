import 'dotenv/config';
import { db } from './src/server/db/index.js';
import * as schema from './src/server/db/schema.js';

// Load .env.local manually
import fs from 'fs';
const envLocal = fs.readFileSync('.env.local', 'utf8');
const dbUrlMatch = envLocal.match(/DATABASE_URL="(.*?)"/);
if (dbUrlMatch) {
  process.env.DATABASE_URL = dbUrlMatch[1];
}

console.log("Using DB:", process.env.DATABASE_URL);

db.select().from(schema.corsairIntegrations).then(r => {
  console.log("Integrations:", r);
  process.exit(0);
}).catch(console.error);
