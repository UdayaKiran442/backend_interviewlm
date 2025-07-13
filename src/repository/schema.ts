import { pgTable, boolean, varchar, integer, timestamp } from "drizzle-orm/pg-core";

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

export const jobs = pgTable('jobs', {
    jobId: varchar('jobId').primaryKey(),
    hrId: varchar('hrId').notNull(),
    companyName: varchar('companyName').notNull(),
    location: varchar('location').notNull(),
    jobTitle: varchar('jobTitle').notNull(),
    jobDescription: varchar('jobDescription').notNull(),
    department: varchar('department').notNull(),
    package: varchar('package'),
    maximumApplications: integer('maximumApplications'),
    applications: integer('applications').notNull().default(0),
    isJobOpen: boolean('isJobOpen').notNull().default(true),
    isScreeningDone: boolean('isScreeningDone').notNull().default(false),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
    updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const rounds = pgTable('rounds', {
    roundId: varchar('roundId').primaryKey(),
    jobId: varchar('jobId').notNull(),
    roundNumber: integer('roundNumber').notNull(),
    roundType: varchar('roundType').notNull(),
    questionType: varchar('questionType').notNull(),
    duration: integer('duration').notNull(),
    difficulty: varchar('difficulty').notNull(),
    roundDescription: varchar('roundDescription'),
    isAI: boolean('isAI').notNull(),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
    updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export type IRound = typeof rounds;