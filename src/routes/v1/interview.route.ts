import { Hono } from "hono";
import z from "zod";

const interviewRoute = new Hono();

const CreateInterviewSchema = z.object({
    applicationId: z.string(),
    roundId: z.string(),
    jobId: z.string(),
})

export type ICreateInterviewSchema = z.infer<typeof CreateInterviewSchema> & { hrId: string, jobDescription?: string, questionType?: string, difficulty?: string }

export default interviewRoute