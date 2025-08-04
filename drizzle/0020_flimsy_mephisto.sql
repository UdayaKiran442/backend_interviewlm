ALTER TABLE "candidates" ADD COLUMN "userId" varchar;--> statement-breakpoint
ALTER TABLE "hr" ADD COLUMN "userId" varchar;--> statement-breakpoint
CREATE INDEX "candidates_user_id_idx" ON "candidates" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "hr_user_id_idx" ON "hr" USING btree ("userId");