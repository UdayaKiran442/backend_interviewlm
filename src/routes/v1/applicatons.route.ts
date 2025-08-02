import { Hono } from "hono";
import z from "zod";
import { applyJob, getApplicationsForJob } from "../../controller/application.controller";
import { NotFoundError } from "../../exceptions/common.exceptions";
import { CloseJobInDBError, GetJobByIdError, JobClosedError, UpdateJobApplicationsCountInDBError } from "../../exceptions/job.exceptions";
import { ApplyJobError, GetApplicationsForJobError, JobAlreadyAppliedError } from "../../exceptions/applications.exceptions";
import { AddApplicationToDBError, CheckCandidateAppliedInDBError } from "../../exceptions/applications.exceptions";
import { QueryVectorEmbeddingsServiceError, UpsertVectorEmbeddingsError, UpsertVectorEmbeddingsServiceError } from "../../exceptions/pinecone.exceptions";
import { GenerateEmbeddingsServiceError, GenerateResumeSummaryServiceError } from "../../exceptions/openai.exceptions";
import { InsertScreeningResultsToDBError } from "../../exceptions/screening.exceptions";
import { GetRoundsByJobIdFromDBError } from "../../exceptions/round.exceptions";
import { UpdateCandidateJobsInDBError } from "../../exceptions/candidate.exceptions";
import { AddApplicationTimelineToDBError } from "../../exceptions/applicationTimeline.exceptions";

const applicationsRoute = new Hono();

const ApplyJobSchema = z.object({
    jobId: z.string(),
    resumeLink: z.string(),
    resumeText: z.string(),
    coverLetterLink: z.string().optional(),
    coverLetterText: z.string().optional(),
})

export type IApplyJobSchema = z.infer<typeof ApplyJobSchema> & { candidateId: string, currentRoundId: string, skills: string[] }

applicationsRoute.post("/job/apply", async (c) => {
    try {
        const validation = ApplyJobSchema.safeParse(await c.req.json())
        if (!validation.success) {
            throw validation.error;
        }
        const payload = {
            ...validation.data,
            candidateId: "candidate-Xh6XqZUcCt6yYpxzvl94S",
            currentRoundId: "",
            skills: [],
        }
        const res = await applyJob(payload)
        return c.json({ success: true, message: 'Application submitted', res }, 200)
    } catch (error) {
        if (error instanceof z.ZodError) {
            const errMessage = JSON.parse(error.message)
            return c.json({ success: false, error: errMessage[0], message: errMessage[0].message }, 400)
        }
        if (error instanceof ApplyJobError || error instanceof JobClosedError || error instanceof JobAlreadyAppliedError || error instanceof CloseJobInDBError || error instanceof AddApplicationToDBError || error instanceof CheckCandidateAppliedInDBError || error instanceof UpsertVectorEmbeddingsServiceError || error instanceof GenerateEmbeddingsServiceError || error instanceof UpsertVectorEmbeddingsError || error instanceof InsertScreeningResultsToDBError || error instanceof QueryVectorEmbeddingsServiceError || error instanceof UpdateJobApplicationsCountInDBError || error instanceof GetJobByIdError || error instanceof GetRoundsByJobIdFromDBError || error instanceof GenerateResumeSummaryServiceError || error instanceof UpdateCandidateJobsInDBError || error instanceof AddApplicationTimelineToDBError) {
            return c.json({ success: false, message: error.message, error: error.cause }, 400)
        }
        if (error instanceof NotFoundError) {
            return c.json({ success: false, message: error.message, error: error.cause }, 404)
        }
        return c.json({ success: false, message: 'Something went wrong' }, 500)
    }
})

const GetApplicationsForJobSchema = z.object({
    jobId: z.string(),
})

export type IGetApplicationsForJobSchema = z.infer<typeof GetApplicationsForJobSchema> & { hrId: string }

applicationsRoute.post("/job", async (c) => {
    try {
        const validation = GetApplicationsForJobSchema.safeParse(await c.req.json())
        if (!validation.success) {
            throw validation.error;
        }
        const payload = {
            ...validation.data,
            hrId: "VofeF3rFUHbcjVZeTamp8"
        }
        const res = await getApplicationsForJob(payload)
        return c.json({ success: true, message: 'Applications fetched', res }, 200)
    } catch (error) {
        if (error instanceof z.ZodError) {
            const errMessage = JSON.parse(error.message)
            return c.json({ success: false, error: errMessage[0], message: errMessage[0].message }, 400)
        }
        if (error instanceof GetApplicationsForJobError) {
            return c.json({ success: false, message: error.message, error: error.cause }, 400)
        }
        console.log(error)
        return c.json({ success: false, message: 'Something went wrong' }, 500)
    }
})

export default applicationsRoute;