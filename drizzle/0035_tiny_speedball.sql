CREATE INDEX "reviewer_company_id_idx" ON "reviewer" USING btree ("companyId");--> statement-breakpoint
CREATE INDEX "validation_reviewer_id_idx" ON "validations_table" USING btree ("reviewerId");