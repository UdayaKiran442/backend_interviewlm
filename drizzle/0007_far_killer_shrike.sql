CREATE TABLE "application_timeline" (
	"applicationTimelineId" varchar PRIMARY KEY NOT NULL,
	"applicationId" varchar NOT NULL,
	"roundId" varchar,
	"title" varchar NOT NULL,
	"description" varchar,
	"status" varchar NOT NULL
);
--> statement-breakpoint
CREATE TABLE "applications" (
	"applicationId" varchar PRIMARY KEY NOT NULL,
	"candidateId" varchar NOT NULL,
	"jobId" varchar NOT NULL,
	"resumeLink" varchar NOT NULL,
	"coverLetterLink" varchar,
	"status" varchar NOT NULL,
	"currentRound" varchar NOT NULL,
	"resumeText" varchar NOT NULL,
	"coverLetterText" varchar,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "candidates" ADD COLUMN "jobs" json DEFAULT '[]'::json NOT NULL;--> statement-breakpoint
CREATE INDEX "application_job_id_idx" ON "applications" USING btree ("jobId");--> statement-breakpoint
CREATE INDEX "application_candidate_id_idx" ON "applications" USING btree ("candidateId");--> statement-breakpoint
CREATE INDEX "rounds_job_id_idx" ON "rounds" USING btree ("jobId");