import { corsair } from "./src/server/corsair.js";

async function main() {
  const tenantId = 'WPxkupEP1qreQyQgrGqqEy2k4CpODBzA';
  const tenant = corsair.withTenant(tenantId);
  
  try {
    const list = await tenant.gmail.api.messages.list({ maxResults: 1 });
    const msgId = list.messages[0].id;
    console.log('Fetching without metadataHeaders', msgId);
    
    const meta = await tenant.gmail.api.messages.get({
      id: msgId,
      format: "metadata"
    });
    
    console.log('Metadata without headers array:', JSON.stringify(meta, null, 2));
  } catch(e) {
    console.error('Error:', e);
  }
}
main();
