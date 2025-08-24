CREATE TABLE "interviewer" (
	"interviewerId" varchar PRIMARY KEY NOT NULL,
	"companyId" varchar NOT NULL,
	"name" varchar NOT NULL,
	"email" varchar NOT NULL,
	"phone" varchar,
	"jobTitle" varchar NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "interviewer_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "validations_table" (
	"validationId" varchar PRIMARY KEY NOT NULL,
	"interviewerId" varchar,
	"interviewId" varchar NOT NULL,
	"jobId" varchar NOT NULL,
	"roundId" varchar NOT NULL,
	"roundResultId" varchar NOT NULL,
	"notes" varchar,
	"status" varchar DEFAULT 'PENDING' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "questions" ALTER COLUMN "isDisplayed" SET NOT NULL;