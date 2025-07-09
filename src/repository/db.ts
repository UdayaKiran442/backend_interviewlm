import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import { ActiveConfig } from "../utils/config.utils";

const sql = neon(ActiveConfig.DATABASE_URL);
const db = drizzle(sql);

export default db;

export type DB = typeof db;