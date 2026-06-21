import "dotenv/config";
import { corsair } from "./src/server/corsair";
import { generateOAuthUrl } from "corsair/oauth";

async function test() {
  try {
    const res = await generateOAuthUrl(corsair, 'gmail', {
      tenantId: 'test-user-id',
      redirectUri: 'http://localhost:3000/api/corsair-callback',
    });
    console.log('SUCCESS:', res);
  } catch (err) {
    console.error('ERROR:', err);
  }
}

test();
