ALTER TABLE "jobs" ADD COLUMN "companyId" varchar NOT NULL;--> statement-breakpoint
ALTER TABLE "jobs" DROP COLUMN "companyName";--> statement-breakpoint
ALTER TABLE "jobs" DROP COLUMN "location";