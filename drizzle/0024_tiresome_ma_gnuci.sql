CREATE TABLE "interview" (
	"interviewId" varchar PRIMARY KEY NOT NULL,
	"applicationId" varchar NOT NULL,
	"roundId" varchar NOT NULL,
	"roundResultsId" varchar,
	"status" varchar NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "questions" (
	"questionId" varchar PRIMARY KEY NOT NULL,
	"interviewId" varchar NOT NULL,
	"question" varchar NOT NULL,
	"answer" varchar,
	"feedback" varchar,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
