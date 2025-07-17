CREATE TABLE "candidates" (
	"candidateId" varchar PRIMARY KEY NOT NULL,
	"firstName" varchar,
	"middleName" varchar,
	"lastName" varchar,
	"email" varchar NOT NULL,
	"phone" varchar,
	"location" varchar,
	"linkedInProfile" varchar,
	"githubProfile" varchar,
	"portfolio" varchar,
	"experience" json,
	"workAuthorization" varchar,
	"willingToRelocate" boolean,
	"isOpenToRemote" varchar,
	"resumeLink" varchar,
	"acceptedTermsAndConditions" boolean,
	"receiveUpdatesOnApplication" boolean,
	"isOnboardingCompleted" boolean DEFAULT false,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "candidates_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"userId" varchar PRIMARY KEY NOT NULL,
	"email" varchar NOT NULL,
	"roles" json NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE INDEX "candidates_email_idx" ON "candidates" USING btree ("email");--> statement-breakpoint
CREATE INDEX "users_email_idx" ON "users" USING btree ("email");