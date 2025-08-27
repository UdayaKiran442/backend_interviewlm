import { Hono } from "hono";
import z from "zod";
import { startAIInterview, submitInterview } from "../../controller/interview.controller";
import { GetInterviewByIdFromDBError, StartAIInterviewError, SubmitInterviewError, UpdateInterviewInDBError } from "../../exceptions/interview.exceptions";
import { GetJobByIdFromDBError, UpdateJobInDBError } from "../../exceptions/job.exceptions";
import { AddApplicationTimelineToDBError } from "../../exceptions/applicationTimeline.exceptions";
import { GetQuestionsByInterviewIdFromDBError } from "../../exceptions/question.exceptions";
import { GenerateInterviewFeedbackServiceError } from "../../exceptions/openai.exceptions";
import { NotFoundError } from "../../exceptions/common.exceptions";
import { InsertValidationInDBError } from "../../exceptions/validationsTable.exceptions";

const interviewRoute = new Hono();

const CreateInterviewSchema = z.object({
	applicationId: z.string(),
	roundId: z.string(),
	jobId: z.string(),
});

export type ICreateInterviewSchema = z.infer<typeof CreateInterviewSchema> & { hrId: string; questionType: string | null; difficulty: string | null };

const StartAIInterviewSchema = z.object({
	interviewId: z.string(),
	jobId: z.string(),
});

export type IStartAIInterviewSchema = z.infer<typeof StartAIInterviewSchema> & { candidateId: string };

interviewRoute.post("/ai/start", async (c) => {
	try {
		const validation = StartAIInterviewSchema.safeParse(await c.req.json());
		if (!validation.success) {
			throw validation.error;
		}
		const payload = {
			...validation.data,
			candidateId: "candidate-Xh6XqZUcCt6yYpxzvl94S",
		};
		await startAIInterview(payload);
		return c.json({ success: true, message: "Interview started", payload }, 200);
	} catch (error) {
		if (error instanceof z.ZodError) {
			const errMessage = JSON.parse(error.message);
			return c.json({ success: false, error: errMessage[0], message: errMessage[0].message }, 400);
		}
		if (
			error instanceof GetJobByIdFromDBError ||
			error instanceof GetInterviewByIdFromDBError ||
			error instanceof UpdateInterviewInDBError ||
			error instanceof UpdateJobInDBError ||
			error instanceof AddApplicationTimelineToDBError ||
			error instanceof StartAIInterviewError
		) {
			return c.json({ success: false, message: error.message, error: error.cause }, 400);
		}
		return c.json({ success: false, message: "Something went wrong" }, 500);
	}
});

const SubmitInterviewSchema = z.object({
	interviewId: z.string(),
});

export type ISubmitInterviewSchema = z.infer<typeof SubmitInterviewSchema> & { candidateId: string };

interviewRoute.post("/submit", async (c) => {
	try {
		const validation = SubmitInterviewSchema.safeParse(await c.req.json());
		if (!validation.success) {
			throw validation.error;
		}
		const payload = {
			...validation.data,
			candidateId: "candidate-Xh6XqZUcCt6yYpxzvl94S",
		};
		const response = await submitInterview(payload);
		return c.json({ success: true, message: "Interview submitted", payload: response }, 200);
	} catch (error) {
		if (error instanceof z.ZodError) {
			const errMessage = JSON.parse(error.message);
			return c.json({ success: false, error: errMessage[0], message: errMessage[0].message }, 400);
		}
		if (
			error instanceof GetQuestionsByInterviewIdFromDBError ||
			error instanceof NotFoundError ||
			error instanceof GenerateInterviewFeedbackServiceError ||
			error instanceof GetInterviewByIdFromDBError ||
			error instanceof AddApplicationTimelineToDBError ||
			error instanceof UpdateInterviewInDBError ||
			error instanceof InsertValidationInDBError ||
			error instanceof SubmitInterviewError
		) {
			return c.json({ success: false, message: error.message, error: error.cause }, 400);
		}
		if (error instanceof NotFoundError) {
			return c.json({ success: false, message: error.message }, 404);
		}
		return c.json({ success: false, message: "Something went wrong" }, 500);
	}
});

export default interviewRoute;
