ALTER TABLE "interview" ADD COLUMN "jobDescription" varchar;--> statement-breakpoint
ALTER TABLE "interview" ADD COLUMN "resumeText" varchar;--> statement-breakpoint
ALTER TABLE "interview" ADD COLUMN "questionType" varchar;--> statement-breakpoint
ALTER TABLE "interview" ADD COLUMN "difficulty" varchar;--> statement-breakpoint
ALTER TABLE "questions" ADD COLUMN "isDisplayed" boolean;--> statement-breakpoint
CREATE INDEX "question_interview_id_idx" ON "questions" USING btree ("interviewId");--> statement-breakpoint
CREATE INDEX "question_displayed_idx" ON "questions" USING btree ("isDisplayed");