import { pgTable, boolean, varchar } from "drizzle-orm/pg-core";

export const company = pgTable('company', {
    companyId: varchar('companyId').primaryKey(),
    name: varchar('name').notNull(),
    location: varchar('location').notNull(),
})

export const hr = pgTable('hr', {
    hrId: varchar('hrId').primaryKey(),
    companyId: varchar('companyId').notNull(),
    name: varchar('name').notNull(),
    email: varchar('email').notNull(),
    phone: varchar('phone').notNull(),
    isOrgAdmin: boolean('isOrgAdmin').notNull().default(false),
})