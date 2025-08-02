import { Hono } from "hono";
import z from "zod";
import { fetchResumeScreeningDetails, fetchScreeningResumes } from "../../controller/screening.controller";
import { GenerateEmbeddingsServiceError, GenerateResumeFeedbackServiceError } from "../../exceptions/openai.exceptions";
import { QueryVectorEmbeddingsServiceError } from "../../exceptions/pinecone.exceptions";
import { FetchResumeScreeningDetailsError, FetchScreeningResumesError, GetResumeScreeningDetailsFromDBError, GetScreeningResumesFromDBError } from "../../exceptions/screening.exceptions";
import { NotFoundError } from "../../exceptions/common.exceptions";
import { InsertRoundResultsToDBError } from "../../exceptions/roundResults.exceptions";

const screeningRoute = new Hono()

const FetchScreeningResumesSchema = z.object({
    jobId: z.string(),
    matchScore: z.number().optional(),
    prompt: z.string().optional(),
})

export type IFetchScreeningResumesSchema = z.infer<typeof FetchScreeningResumesSchema> & { hrId: string }

screeningRoute.post('/fetch/resumes', async (c) => {
    try {
        const validation = FetchScreeningResumesSchema.safeParse(await c.req.json())
        if (!validation.success) {
            throw validation.error
        }
        const payload = {
            ...validation.data,
            hrId: "VofeF3rFUHbcjVZeTamp8"
        }
        const res = await fetchScreeningResumes(payload)
        return c.json({ success: true, message: 'Screening resumes fetched', res }, 200)
    } catch (error) {
        if (error instanceof z.ZodError) {
            const errMessage = JSON.parse(error.message)
            return c.json({ success: false, error: errMessage[0], message: errMessage[0].message }, 400)
        }
        if (error instanceof GenerateEmbeddingsServiceError || error instanceof QueryVectorEmbeddingsServiceError || error instanceof FetchScreeningResumesError || error instanceof GetScreeningResumesFromDBError) {
            return c.json({ success: false, message: error.message, error: error.cause }, 400)
        }
        return c.json({ success: false, message: 'Something went wrong' }, 500)
    }
})

const FetchResumeScreeningDetailsSchema = z.object({
    screeningId: z.string(),
})

export type IFetchResumeScreeningDetailsSchema = z.infer<typeof FetchResumeScreeningDetailsSchema> & { hrId: string }

screeningRoute.post('/fetch/details', async (c) => {
    try {
        const validation = FetchResumeScreeningDetailsSchema.safeParse(await c.req.json())
        if (!validation.success) {
            throw validation.error
        }
        const payload = {
            ...validation.data,
            hrId: "VofeF3rFUHbcjVZeTamp8"
        }
        const res = await fetchResumeScreeningDetails(payload)
        return c.json({ success: true, message: 'Resume screening details fetched', res }, 200)
    } catch (error) {
        if (error instanceof z.ZodError) {
            const errMessage = JSON.parse(error.message)
            return c.json({ success: false, error: errMessage[0], message: errMessage[0].message }, 400)
        }
        if (error instanceof FetchResumeScreeningDetailsError || error instanceof GetResumeScreeningDetailsFromDBError || error instanceof NotFoundError || error instanceof GenerateResumeFeedbackServiceError || error instanceof InsertRoundResultsToDBError) {
            return c.json({ success: false, message: error.message, error: error.cause }, 400)
        }
        return c.json({ success: false, message: 'Something went wrong' }, 500)
    }
})

export default screeningRoute;