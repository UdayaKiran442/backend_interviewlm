import { ICreateQuestionInDB } from "../../types/types";
import { generateNanoId } from "../../utils/nanoid.utils";
import db from "../db";
import { questions } from "../schema";
import { CreateQuestionInDBError, InsertBulkQuestionsInDBError } from "../../exceptions/question.exceptions";

export async function createQuestionInDB(payload: ICreateQuestionInDB) {
    try {
        const insertPayload = {
            questionId: `question-${generateNanoId()}`,
            interviewId: payload.interviewId,
            question: payload.question,
            createdAt: new Date(),
            updatedAt: new Date(),
        }
        await db.insert(questions).values(insertPayload)
    } catch (error) {
        throw new CreateQuestionInDBError('Failed to create question in DB', { cause: (error as Error).message });
    }
}

export async function insertBulkQuestionsInDB(payload: {interviewId: string, questions: string[]}){
    try {
        const insertPayload = payload.questions.map((question) => {
            return {
                questionId: `question-${generateNanoId()}`,
                interviewId: payload.interviewId,
                question,
                createdAt: new Date(),
                updatedAt: new Date(),
            }
        })
        await db.insert(questions).values(insertPayload)
        return insertPayload;
    } catch (error) {
        throw new InsertBulkQuestionsInDBError('Failed to insert bulk questions in DB', { cause: (error as Error).message });
    }
}