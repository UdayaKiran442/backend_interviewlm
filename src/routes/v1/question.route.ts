import { Hono } from "hono";
import z from "zod";
import {
	FetchNextQuestionError,
	GetQuestionByIdFromDBError,
	InsertQuestionToDBError,
	NextQuestionFromDBError,
	SubmitQuestionError,
	UpdateQuestionInDBError,
} from "../../exceptions/question.exceptions";
import { GenerateFeedbackToQuestionServiceError, GenerateFollowUpQuestionServiceError } from "../../exceptions/openai.exceptions";
import { nextQuestion, submitQuestion } from "../../controller/question.controller";
import { GetInterviewByIdFromDBError } from "../../exceptions/interview.exceptions";
import { NotFoundError } from "../../exceptions/common.exceptions";

const questionRoute = new Hono();

const NextQuestionSchema = z.object({
	interviewId: z.string(),
});

export type INextQuestionSchema = z.infer<typeof NextQuestionSchema> & { candidateId: string };

questionRoute.post("/next", async (c) => {
	try {
		const validation = NextQuestionSchema.safeParse(await c.req.json());
		if (!validation.success) {
			throw validation.error;
		}
		const payload = {
			...validation.data,
			candidateId: "candidate-Xh6XqZUcCt6yYpxzvl94S",
		};
		const response = await nextQuestion(payload);
		return c.json({ success: true, message: "Next question fetched", response }, 200);
	} catch (error) {
		if (error instanceof z.ZodError) {
			const errMessage = JSON.parse(error.message);
			return c.json({ success: false, error: errMessage[0], message: errMessage[0].message }, 400);
		}
		if (
			error instanceof NextQuestionFromDBError ||
			error instanceof UpdateQuestionInDBError ||
			error instanceof GenerateFollowUpQuestionServiceError ||
			error instanceof InsertQuestionToDBError ||
			error instanceof FetchNextQuestionError
		) {
			return c.json({ success: false, message: error.message, error: error.cause }, 400);
		}
		return c.json({ success: false, message: "Something went wrong" }, 500);
	}
});

const SubmitQuestionSchema = z.object({
	interviewId: z.string(),
	questionId: z.string(),
	answerText: z.string(),
});

export type ISubmitQuestionSchema = z.infer<typeof SubmitQuestionSchema> & { candidateId: string };

questionRoute.post("/submit", async (c) => {
	try {
		const validation = SubmitQuestionSchema.safeParse(await c.req.json());
		if (!validation.success) {
			throw validation.error;
		}
		const payload = {
			...validation.data,
			candidateId: "candidate-Xh6XqZUcCt6yYpxzvl94S",
		};
		await submitQuestion(payload);
		return c.json({ success: true, message: "Question submitted" }, 200);
	} catch (error) {
		if (error instanceof z.ZodError) {
			const errMessage = JSON.parse(error.message);
			return c.json({ success: false, error: errMessage[0], message: errMessage[0].message }, 400);
		}
		if (error instanceof NotFoundError) {
			return c.json({ success: false, message: error.message, error: error.cause }, 404);
		}
		if (
			error instanceof GetQuestionByIdFromDBError ||
			error instanceof GenerateFeedbackToQuestionServiceError ||
			error instanceof GetInterviewByIdFromDBError ||
			error instanceof UpdateQuestionInDBError ||
			error instanceof SubmitQuestionError
		) {
			return c.json({ success: false, message: error.message, error: error.cause }, 400);
		}
		return c.json({ success: false, message: "Something went wrong" }, 500);
	}
});

export default questionRoute;
