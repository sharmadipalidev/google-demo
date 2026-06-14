import { corsair } from "./src/server/corsair";

async function main() {
  try {
    const tenant = corsair;
    const result = await tenant.googlecalendar.api.events.getMany({
      calendarId: 'primary',
      maxResults: 10
    });
    
    const recurringInstances = result.items?.filter(i => i.id?.startsWith('_'));
    if (recurringInstances && recurringInstances.length > 0) {
      const id = recurringInstances[0].id!;
      console.log("Attempting to delete recurring instance:", id);
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
    } else {
      console.log("No recurring instances found.");
    }
  } catch (e) {
    console.error(e);
  }
}

main();
