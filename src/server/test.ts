import { corsair } from "./corsair";
import "dotenv/config";
const main = async () => {
  const res = await corsair.withTenant("dev").gmail.db.threads.list({});
  console.log(res);
};

main();
