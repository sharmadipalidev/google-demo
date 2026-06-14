import { corsair } from "./src/server/corsair";

async function main() {
  try {
    const tenant = corsair;
    const result = await tenant.googlecalendar.api.events.getMany({
      calendarId: 'primary',
      maxResults: 50
    });
    
    if (!result.items) return;
    
    for (const item of result.items) {
      if (!item.id) continue;
      console.log(`Trying to delete ${item.id} - ${item.summary}`);
      try {
        await tenant.googlecalendar.api.events.delete({
          calendarId: 'primary',
          id: item.id
        });
        console.log("-> SUCCESS");
      } catch (e: any) {
        console.error("-> FAILED:", e.message);
        if (e.response?.data) console.error("Response:", JSON.stringify(e.response.data));
        else if (e.body) console.error("Body:", e.body);
      }
    }
  } catch (e) {
    console.error(e);
  }
}

main();
