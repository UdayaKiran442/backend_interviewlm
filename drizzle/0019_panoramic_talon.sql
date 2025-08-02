ALTER TABLE "resume_screening" ADD COLUMN "roundResultId" varchar;--> statement-breakpoint
ALTER TABLE "round_results" ADD COLUMN "isQualified" boolean;