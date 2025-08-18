import { NeonHttpDatabase, NeonHttpQueryResultHKT } from "drizzle-orm/neon-http";
import { NeonQueryResultHKT } from "drizzle-orm/neon-serverless";
import { PgTransaction } from "drizzle-orm/pg-core";
import { ExtractTablesWithRelations } from "drizzle-orm";

type NeonTransaction = PgTransaction<NeonHttpQueryResultHKT | NeonQueryResultHKT, Record<string, never>, ExtractTablesWithRelations<Record<string, never>>>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type dbTx = NeonHttpDatabase<any> | NeonTransaction;