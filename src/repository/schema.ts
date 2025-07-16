import { pgTable, boolean, varchar, integer, timestamp, json, index } from "drizzle-orm/pg-core";

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
    companyId: varchar('companyId').notNull(),
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

export const users = pgTable('users', {
    userId: varchar('userId').primaryKey(),
    email: varchar('email').notNull().unique(),
    roles: json('roles').notNull(),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
    updatedAt: timestamp('updatedAt').notNull().defaultNow(),
}, (users) => ({
    usersEmailIdx: index('users_email_idx').on(users.email)
}))

export const candidates = pgTable('candidates', {
    candidateId: varchar('candidateId').primaryKey(),
    firstName: varchar('firstName'),
    middleName: varchar('middleName'),
    lastName: varchar('lastName'),
    email: varchar('email').notNull().unique(),
    phone: varchar('phone'),
    location: varchar('location'),
    linkedInProfile: varchar('linkedInProfile'),
    githubProfile: varchar('githubProfile'),
    portfolio: varchar('portfolio'),
    experience: json('experience'),
    workAuthorization: varchar('workAuthorization'),
    willingToRelocate: boolean('willingToRelocate'),
    isOpenToRemote: boolean('isOpenToRemote'),
    resumeLink: varchar('resumeLink'),
    acceptedTermsAndConditions: boolean('acceptedTermsAndConditions'),
    receiveUpdatesOnApplication: boolean('receiveUpdatesOnApplication'),
    isOnboardingCompleted: boolean('isOnboardingCompleted').default(false),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
    updatedAt: timestamp('updatedAt').notNull().defaultNow(),
}, (candidates) => ({
    candidatesEmailIdx: index('candidates_email_idx').on(candidates.email)
}))

export type IRound = typeof rounds;
export type ICandidate = typeof candidates;