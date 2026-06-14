import { corsair } from "./src/server/corsair";

async function main() {
  try {
    const tenant = corsair;
    const result = await tenant.googlecalendar.api.events.getMany({
      calendarId: 'primary',
      maxResults: 5
    });
    console.log("Events:", result.items?.map((i: any) => i.id));
    
    if (result.items && result.items.length > 0) {
      const id = result.items[0].id!;
      console.log("Attempting to delete:", id);
      try {
        await tenant.googlecalendar.api.events.delete({
          calendarId: 'primary',
          id: id
        });
        console.log("Delete successful");
      } catch (e: any) {
        console.error("Delete failed:", e.message);
        if (e.status) console.error("Status:", e.status);
        if (e.response?.data) console.error("Response data:", e.response.data);
      }
    }
  } catch (e) {
    console.error(e);
  }
}

main();
