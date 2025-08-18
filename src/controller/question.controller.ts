import { FetchNextQuestionError, NextQuestionFromDBError, UpdateQuestionInDBError } from "../exceptions/question.exceptions";
import db from "../repository/db";
import type { dbTx } from "../repository/db.types";
import { getLatestInterviewResponseFromDB, nextQuestionFromDB, updateQuestionInDB } from "../repository/question/question.repository";
import type { INextQuestionSchema } from "../routes/v1/question.route";
import { GenerateFollowUpQuestionServiceError } from "../exceptions/openai.exceptions";
import { generateFollowUpQuestionService } from "../services/openai.service";

export async function nextQuestion(payload: INextQuestionSchema) {
	try {
		const result = await db.transaction(async (tx: dbTx) => {
			// fetch next question from db
			const question = await nextQuestionFromDB(payload);
			if (question.length === 0) {
				const latestResponse = await getLatestInterviewResponseFromDB(payload.interviewId);
				// if not present then generate questions from llm and return the question
				const response = await generateFollowUpQuestionService({
					userResponse: latestResponse[0].answer ?? '',
					jobDescription: "",
					resumeText: "",
					questionType: "",
					difficulty: "",
				});
				// insert question in questions table and return the question
			}
			// if present then return the question, and update isDisplayed in db to true
			await updateQuestionInDB(
				{
					questionId: question[0].questionId,
					isDisplayed: true,
				},
				tx,
			);
			return question;
		});
		return result;
	} catch (error) {
		if (error instanceof NextQuestionFromDBError || error instanceof UpdateQuestionInDBError || error instanceof GenerateFollowUpQuestionServiceError) {
			throw error;
		}
		throw new FetchNextQuestionError("Failed to fetch next question", { cause: (error as Error).message });
	}
}
