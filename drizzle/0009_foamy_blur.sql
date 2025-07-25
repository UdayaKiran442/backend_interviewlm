CREATE TABLE "resume_screening" (
	"screeningId" varchar PRIMARY KEY NOT NULL,
	"applicationId" varchar NOT NULL,
	"jobId" varchar NOT NULL,
	"candidateId" varchar NOT NULL,
	"matchScore" real NOT NULL,
	"feedback" json,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
