import { corsair } from "./corsair";
import "dotenv/config";
const main = async () => {
  const res = await corsair
    .googlecalendar.api.events.create({});
  console.log(res);
};

main();
