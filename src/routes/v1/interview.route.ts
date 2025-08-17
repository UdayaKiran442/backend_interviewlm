import { Hono } from "hono";
import z from "zod";

const interviewRoute = new Hono();

const CreateInterviewSchema = z.object({
	applicationId: z.string(),
	roundId: z.string(),
	jobId: z.string(),
});

export type ICreateInterviewSchema = z.infer<typeof CreateInterviewSchema> & { hrId: string; questionType: string | null; difficulty: string | null };

export default interviewRoute;
