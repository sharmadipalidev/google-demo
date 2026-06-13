import { corsair } from "./corsair";
import "dotenv/config";
const main = async () => {
  const res = await corsair
    .withTenant("dev")
    .googlecalendar.api.events.create({});
  console.log(res);
};

main();
