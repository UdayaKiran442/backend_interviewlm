import { Hono } from "hono";
import z from "zod";
import { CreateJobInDBError } from "../exceptions/job.exceptions";
import { CreateRoundInDBError } from "../exceptions/round.exceptions";
import { createJob } from "../controller/job.controller";

const jobRoute = new Hono();

const CreateJobSchema = z.object({
    companyId: z.string(),
    jobTitle: z.string(),
    jobDescription: z.string(),
    department: z.string(),
    package: z.string().optional(),
    maximumApplications: z.number().optional(),
    rounds: z.array(z.object({
        roundNumber: z.number(),
        roundType: z.string(),
        questionType: z.string(),
        duration: z.number().positive(),
        difficulty: z.string(),
        roundDescription: z.string().optional(),
        isAI: z.boolean(),
    }))
})

export type ICreateJobSchema = z.infer<typeof CreateJobSchema> & { hrId: string }

jobRoute.post('/create', async (c) => {
    try {
        const validation = CreateJobSchema.safeParse(await c.req.json())
        if (!validation.success) {
            throw validation.error;
        }
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
        if (error instanceof CreateJobInDBError || error instanceof CreateRoundInDBError) {
            return c.json({ success: false, message: error.message, error: error.cause }, 400)
        }
    }
})

export default jobRoute;