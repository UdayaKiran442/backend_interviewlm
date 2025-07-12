CREATE TABLE "company" (
	"companyId" varchar PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"location" varchar NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr" (
	"hrId" varchar PRIMARY KEY NOT NULL,
	"companyId" varchar NOT NULL,
	"name" varchar NOT NULL,
	"email" varchar NOT NULL,
	"phone" varchar NOT NULL,
	"isOrgAdmin" boolean DEFAULT false NOT NULL
);
