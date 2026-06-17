import { corsair } from "./src/server/corsair";

async function main() {
  try {
    const tenant = corsair;
    const startIso = new Date().toISOString();
    const endIso = new Date(Date.now() + 3600000).toISOString();
    
    console.log("Creating event...");
    const createResult = await tenant.googlecalendar.api.events.create({
      calendarId: 'primary',
      event: {
        summary: "Test Event to Delete",
        start: { dateTime: startIso },
        end: { dateTime: endIso }
      }
    });
    const id = createResult.id;
    if (!id) return;
    console.log("Created event with id:", id);
    
    console.log("Attempting to delete:", id);
    try {
      await tenant.googlecalendar.api.events.delete({
        calendarId: 'primary',
        id: id
      });
      console.log("Delete successful");
    } catch (e: any) {
      console.error("Delete failed:", e.message);
      if (e.response?.data) console.error("Response data:", JSON.stringify(e.response.data));
    }
  } catch (e) {
    console.error(e);
  }
}

main();
