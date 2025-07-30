import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";

import { ActiveConfig } from "../utils/config.utils";

const pool = new Pool({
    connectionString: ActiveConfig.DATABASE_URL,
});
const db = drizzle({client: pool});

export default db;

export type DB = typeof db;