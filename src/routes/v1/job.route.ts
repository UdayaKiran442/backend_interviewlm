import { Hono } from "hono";
import z from "zod";
import { CloseJobError, CloseJobInDBError, CreateJobError, CreateJobInDBError } from "../../exceptions/job.exceptions";
import { CreateRoundInDBError } from "../../exceptions/round.exceptions";
import { closeJob, createJob } from "../../controller/job.controller";
import { NotFoundError, UnauthorizedError } from "../../exceptions/common.exceptions";
import { UpsertVectorEmbeddingsError, UpsertVectorEmbeddingsServiceError } from "../../exceptions/pinecone.exceptions";
import { GenerateEmbeddingsServiceError } from "../../exceptions/openai.exceptions";

const jobRoute = new Hono();

const CreateJobSchema = z.object({
    companyId: z.string(),
    jobTitle: z.string(),
    jobDescription: z.string(),
    department: z.string(),
    package: z.string().optional(),
    location: z.string().optional(),
    maximumApplications: z.number().optional(),
    rounds: z.array(z.object({
        roundNumber: z.number(),
        roundType: z.string(),
        questionType: z.string().optional(),
        duration: z.number().positive().optional(),
        difficulty: z.string().optional(),
        roundDescription: z.string().optional(),
        isAI: z.boolean(),
    }))
})

export type ICreateJobSchema = z.infer<typeof CreateJobSchema> & { hrId: string }

jobRoute.post('/create', async (c) => {
    try {
        // validate request body
        const validation = CreateJobSchema.safeParse(await c.req.json())
        if (!validation.success) {
            throw validation.error;
        }
        // call create job controller
        const res = await createJob({
            ...validation.data,
            hrId: "VofeF3rFUHbcjVZeTamp8"
        })
        return c.json({ success: true, message: 'Job created', res }, 200)
    } catch (error) {
        if (error instanceof z.ZodError) {
            const errMessage = JSON.parse(error.message)
            return c.json({ success: false, error: errMessage[0], message: errMessage[0].message }, 400)
        }
        if (error instanceof CreateJobInDBError || error instanceof CreateRoundInDBError || error instanceof CreateJobError || error instanceof UpsertVectorEmbeddingsServiceError || error instanceof GenerateEmbeddingsServiceError || error instanceof UpsertVectorEmbeddingsError) {
            return c.json({ success: false, message: error.message, error: error.cause }, 400)
        }
        return c.json({ success: false, message: 'Something went wrong' }, 500)
    }
})

const CloseJobSchema = z.object({
    jobId: z.string(),
})

export type ICloseJobSchema = z.infer<typeof CloseJobSchema> & { hrId: string }

jobRoute.post("/close", async(c) => {
    try {
        const validation = CloseJobSchema.safeParse(await c.req.json())
        if (!validation.success) {
            throw validation.error;
        }
        const payload = {
            ...validation.data,
            hrId: "VofeF3rFUHbcjVZeTamp8"
        }
        const res = await closeJob(payload)
        return c.json({ success: true, message: 'Job closed', res }, 200)
    } catch (error) {
        if (error instanceof z.ZodError) {
            const errMessage = JSON.parse(error.message)
            return c.json({ success: false, error: errMessage[0], message: errMessage[0].message }, 400)
        }
        if (error instanceof CloseJobInDBError || error instanceof CloseJobError) {
            return c.json({ success: false, message: error.message, error: error.cause }, 400)
        }
        if (error instanceof NotFoundError) {
            return c.json({ success: false, message: error.message, error: error.cause }, 404)
        }
        if (error instanceof UnauthorizedError) {
            return c.json({ success: false, message: error.message, error: error.cause }, 401)
        }
        return c.json({ success: false, message: 'Something went wrong' }, 500)
    }
})

export default jobRoute;