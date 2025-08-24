ALTER TABLE "interviewer" RENAME TO "reviewer";--> statement-breakpoint
ALTER TABLE "reviewer" RENAME COLUMN "interviewerId" TO "reviewerId";--> statement-breakpoint
ALTER TABLE "validations_table" RENAME COLUMN "interviewerId" TO "reviewerId";--> statement-breakpoint
ALTER TABLE "reviewer" DROP CONSTRAINT "interviewer_email_unique";--> statement-breakpoint
ALTER TABLE "reviewer" ADD CONSTRAINT "reviewer_email_unique" UNIQUE("email");