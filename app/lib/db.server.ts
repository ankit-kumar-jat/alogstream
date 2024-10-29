import { drizzle } from "drizzle-orm/node-postgres";
import { remember } from "@epic-web/remember";

const db = remember("drizzle", () => {
  // NOTE: if you change anything in this function you'll need to restart
  // the dev server to see your changes.
  return drizzle(process.env.DATABASE_URL);
});

export { db };
