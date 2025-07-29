CREATE INDEX "resume_screening_application_id_idx" ON "resume_screening" USING btree ("applicationId");--> statement-breakpoint
CREATE INDEX "resume_screening_job_id_idx" ON "resume_screening" USING btree ("jobId");--> statement-breakpoint
CREATE INDEX "resume_screening_candidate_id_idx" ON "resume_screening" USING btree ("candidateId");--> statement-breakpoint
CREATE INDEX "resume_screening_match_score_idx" ON "resume_screening" USING btree ("matchScore");