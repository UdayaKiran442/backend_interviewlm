import db from "../repository/db";
import type { dbTx } from "../repository/db.types";
import { FetchNextQuestionError, InsertQuestionToDBError, NextQuestionFromDBError, UpdateQuestionInDBError } from "../exceptions/question.exceptions";
import { getLatestInterviewResponseFromDB, insertQuestionInDB, nextQuestionFromDB, updateQuestionInDB } from "../repository/question/question.repository";
import type { INextQuestionSchema } from "../routes/v1/question.route";
import { GenerateFollowUpQuestionServiceError } from "../exceptions/openai.exceptions";
import { generateFollowUpQuestionService } from "../services/openai.service";
import { getInterviewByIdFromDB } from "../repository/interview/interview.repository";

export async function nextQuestion(payload: INextQuestionSchema) {
	try {
		const result = await db.transaction(async (tx: dbTx) => {
			// fetch next question from db
			const question = await nextQuestionFromDB(payload);
			if (question.length === 0) {
				const [latestResponse, interview] = await Promise.all([getLatestInterviewResponseFromDB(payload.interviewId), getInterviewByIdFromDB(payload.interviewId)]);
				// if not present then generate questions from llm and return the question
				const question = await generateFollowUpQuestionService({
					userResponse: latestResponse[0].answer ?? "",
					jobDescription: interview[0].jobDescription ?? "",
					resumeText: interview[0].resumeText ?? "",
					questionType: interview[0].questionType ?? "",
					difficulty: interview[0].difficulty ?? "",
				});
				// insert question in questions table and return the question
				// TODO: background job
				await insertQuestionInDB({
					interviewId: payload.interviewId,
					question: question.response,
					isDisplayed: true,
				});
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
		if (error instanceof NextQuestionFromDBError || error instanceof UpdateQuestionInDBError || error instanceof GenerateFollowUpQuestionServiceError || error instanceof InsertQuestionToDBError) {
			throw error;
		}
		throw new FetchNextQuestionError("Failed to fetch next question", { cause: (error as Error).message });
	}
}
