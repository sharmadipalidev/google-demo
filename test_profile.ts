import { corsair } from './src/server/corsair';

async function main() {
  await corsair.keys.gmail.set_topic_id("test-user");
  const profile = await corsair.gmail.api.users.getProfile({ userId: 'me' });
  console.log(profile);
}

main().catch(console.error);
