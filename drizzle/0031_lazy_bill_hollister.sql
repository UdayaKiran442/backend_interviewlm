CREATE INDEX "reviewer_name_idx" ON "reviewer" USING btree ("name");--> statement-breakpoint
CREATE INDEX "reviewer_email_idx" ON "reviewer" USING btree ("email");