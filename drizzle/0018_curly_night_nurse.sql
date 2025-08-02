ALTER TABLE "round_results" ALTER COLUMN "verdictBy" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "round_results" ADD COLUMN "applicationId" varchar NOT NULL;