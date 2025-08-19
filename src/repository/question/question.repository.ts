import db from "../db";
import type { ICreateQuestionInDB, IUpdateQuestionInDB } from "../../types/types";
import { generateNanoId } from "../../utils/nanoid.utils";
import { questions } from "../schema";
import { CreateQuestionInDBError, InsertBulkQuestionsInDBError, InsertQuestionToDBError, NextQuestionFromDBError, UpdateQuestionInDBError } from "../../exceptions/question.exceptions";
import type { INextQuestionSchema } from "../../routes/v1/question.route";
import { and, desc, eq } from "drizzle-orm";
import type { dbTx } from "../db.types";
import { GetLatestInterviewResponseFromDB } from "../../exceptions/interview.exceptions";

export async function createQuestionInDB(payload: ICreateQuestionInDB) {
	try {
		const insertPayload = {
			questionId: `question-${generateNanoId()}`,
			interviewId: payload.interviewId,
			question: payload.question,
			createdAt: new Date(),
			updatedAt: new Date(),
		};
		await db.insert(questions).values(insertPayload);
	} catch (error) {
		throw new CreateQuestionInDBError("Failed to create question in DB", { cause: (error as Error).message });
	}
}

export async function insertBulkQuestionsInDB(payload: { interviewId: string; questions: string[] }) {
	try {
		const insertPayload = payload.questions.map((question) => {
			return {
				questionId: `question-${generateNanoId()}`,
				interviewId: payload.interviewId,
				question,
				createdAt: new Date(),
				updatedAt: new Date(),
			};
		});
		await db.insert(questions).values(insertPayload);
		return insertPayload;
	} catch (error) {
		throw new InsertBulkQuestionsInDBError("Failed to insert bulk questions in DB", { cause: (error as Error).message });
	}
}

export async function nextQuestionFromDB(payload: INextQuestionSchema) {
	try {
		return await db
			.select()
			.from(questions)
			.where(and(eq(questions.interviewId, payload.interviewId), eq(questions.isDisplayed, false)))
			.limit(1);
	} catch (error) {
		throw new NextQuestionFromDBError("Failed to fetch next question from DB", { cause: (error as Error).message });
	}
}

export async function updateQuestionInDB(payload: IUpdateQuestionInDB, tx?: dbTx) {
	try {
		const dbConnection = db || tx;
		const updatedPayload = {
			...payload,
			updatedAt: new Date(),
		};
		await dbConnection.update(questions).set(updatedPayload).where(eq(questions.questionId, payload.questionId));
	} catch (error) {
		throw new UpdateQuestionInDBError("Failed to update question in DB", { cause: (error as Error).message });
	}
}

export async function getLatestInterviewResponseFromDB(interviewId: string) {
	try {
		return await db.select().from(questions).where(eq(questions.interviewId, interviewId)).orderBy(desc(questions.updatedAt)).limit(1);
	} catch (error) {
        throw new GetLatestInterviewResponseFromDB("Failed to get latest interview response from DB", { cause: (error as Error).message });
    }
}

export async function insertQuestionInDB(payload: ICreateQuestionInDB){
	try {
		const insertPayload = {
			questionId: `question-${generateNanoId()}`,
			interviewId: payload.interviewId,
			question: payload.question,
			isDisplayed: payload.isDisplayed,
			createdAt: new Date(),
			updatedAt: new Date(),
		}
		await db.insert(questions).values(insertPayload);
		return insertPayload;
	} catch (error) {
		throw new InsertQuestionToDBError("Failed to insert question to DB", { cause: (error as Error).message });
	}
}