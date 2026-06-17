import { corsair } from './src/server/corsair';

async function main() {
  await corsair.keys.gmail.set_topic_id("test-user");
  try {
    const result = await corsair.googlecalendar.api.events.create({
      calendarId: "primary",
      conferenceDataVersion: 1,
      event: {
        summary: "Test Event",
        description: "",
        start: { dateTime: "2026-06-20T22:00:00Z" },
        end: { dateTime: "2026-06-20T23:00:00Z" },
        colorId: "",
        conferenceData: {
          createRequest: {
            requestId: Math.random().toString(36).substring(7),
            conferenceSolutionKey: { type: "hangoutsMeet" }
          }
        }
      } as any,
    });
    console.log("Success:", result);
  } catch (e: any) {
    console.error("Error:", e.message);
    if (e.response?.data) console.error(JSON.stringify(e.response.data, null, 2));
    if (e.body) console.error(JSON.stringify(e.body, null, 2));
  }
}

main().catch(console.error);
