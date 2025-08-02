CREATE TABLE "round_results" (
	"roundResultId" varchar PRIMARY KEY NOT NULL,
	"roundId" varchar NOT NULL,
	"feedback" json,
	"verdictBy" varchar NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "resume_screening" ADD COLUMN "roundId" varchar NOT NULL;--> statement-breakpoint
ALTER TABLE "resume_screening" DROP COLUMN "feedback";