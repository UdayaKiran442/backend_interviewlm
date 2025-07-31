import { NeonHttpDatabase, NeonHttpQueryResultHKT } from "drizzle-orm/neon-http";
import { PgTransaction } from "drizzle-orm/pg-core";
import { ExtractTablesWithRelations } from "drizzle-orm";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type dbTx = NeonHttpDatabase<any> | PgTransaction<NeonHttpQueryResultHKT, Record<string, never>, ExtractTablesWithRelations<Record<string, never>>>;