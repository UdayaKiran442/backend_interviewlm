import { Hono } from "hono";
import z from "zod";
import { FetchNextQuestionError, InsertQuestionToDBError, NextQuestionFromDBError, UpdateQuestionInDBError } from "../../exceptions/question.exceptions";
import { GenerateFollowUpQuestionServiceError } from "../../exceptions/openai.exceptions";
import { nextQuestion } from "../../controller/question.controller";

const questionRoute = new Hono();

const NextQuestionSchema = z.object({
	interviewId: z.string(),
	jobId: z.string(),
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
            candidateId: "candidate-Xh6XqZUcCt6yYpxzvl94S"
        }
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

export default questionRoute;
