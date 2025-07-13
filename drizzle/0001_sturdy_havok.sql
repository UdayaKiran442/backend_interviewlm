CREATE TABLE "jobs" (
	"jobId" varchar PRIMARY KEY NOT NULL,
	"hrId" varchar NOT NULL,
	"companyName" varchar NOT NULL,
	"location" varchar NOT NULL,
	"jobTitle" varchar NOT NULL,
	"jobDescription" varchar NOT NULL,
	"department" varchar NOT NULL,
	"package" varchar,
	"maximumApplications" integer,
	"applications" integer DEFAULT 0 NOT NULL,
	"isJobOpen" boolean DEFAULT true NOT NULL,
	"isScreeningDone" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rounds" (
	"roundId" varchar PRIMARY KEY NOT NULL,
	"jobId" varchar NOT NULL,
	"roundNumber" integer NOT NULL,
	"roundType" varchar NOT NULL,
	"questionType" varchar NOT NULL,
	"duration" timestamp NOT NULL,
	"difficulty" varchar NOT NULL,
	"roundDescription" varchar,
	"isAI" boolean NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
