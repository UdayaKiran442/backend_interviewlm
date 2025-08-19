import db from "../repository/db";
import type { dbTx } from "../repository/db.types";
import { FetchNextQuestionError, GetQuestionByIdFromDBError, InsertQuestionToDBError, NextQuestionFromDBError, SubmitQuestionError, UpdateQuestionInDBError } from "../exceptions/question.exceptions";
import { getLatestInterviewResponseFromDB, getQuestionByIdFromDB, insertQuestionInDB, nextQuestionFromDB, updateQuestionInDB } from "../repository/question/question.repository";
import type { INextQuestionSchema, ISubmitQuestionSchema } from "../routes/v1/question.route";
import { GenerateFeedbackToQuestionServiceError, GenerateFollowUpQuestionServiceError } from "../exceptions/openai.exceptions";
import { generateFeedbackToQuestionService, generateFollowUpQuestionService } from "../services/openai.service";
import { getInterviewByIdFromDB } from "../repository/interview/interview.repository";
import { GetInterviewByIdFromDBError } from "../exceptions/interview.exceptions";
import { NotFoundError } from "../exceptions/common.exceptions";

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

export async function submitQuestion(payload: ISubmitQuestionSchema) {
	try {
		// fetch question and interview details
		const [question, interview] = await Promise.all([await getQuestionByIdFromDB(payload.questionId), await getInterviewByIdFromDB(payload.interviewId)]);
		if(question.length === 0 || interview.length === 0){
			throw new NotFoundError("Question or Interview not found");
		}

		// llm function to generate feedback of the question
		const feedback = await generateFeedbackToQuestionService({
			answerText: payload.answerText,
			questionText: question[0].question,
			resumeText: interview[0].resumeText,
		});

		// store feedback in db
		// TODO: background job
		await updateQuestionInDB({
			questionId: payload.questionId,
			feedback: feedback.response,
		});
	} catch (error) {
		if (
			error instanceof GetQuestionByIdFromDBError ||
			error instanceof GenerateFeedbackToQuestionServiceError ||
			error instanceof GetInterviewByIdFromDBError ||
			error instanceof UpdateQuestionInDBError ||
			error instanceof NotFoundError
		) {
			throw error;
		}
		throw new SubmitQuestionError("Failed to submit question", { cause: (error as Error).message });
	}
}
