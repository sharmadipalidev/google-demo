import { corsair } from './src/server/corsair';

async function main() {
  await corsair.keys.gmail.set_topic_id("test-user");
  const email = [
    `To: me`,
    `Subject: Test email to me`,
    'Content-Type: text/plain; charset="UTF-8"',
    "",
    "This is a test email.",
  ].join("\r\n");

  const raw = Buffer.from(email)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  const result = await corsair.gmail.api.messages.send({ raw });
  console.log(result);
}

main().catch(console.error);
