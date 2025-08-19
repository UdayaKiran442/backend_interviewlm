import { eq } from "drizzle-orm";
import db from "../db";
import { interview } from "../schema";
import type { dbTx } from "../db.types";
import { CreateInterviewInDBError, GetInterviewByIdFromDBError, UpdateInterviewInDBError } from "../../exceptions/interview.exceptions";
import { generateNanoId } from "../../utils/nanoid.utils";
import type { ICreateInterviewInDB, IUpdateInterviewInDB } from "../../types/types";

export async function createInterviewInDB(payload: ICreateInterviewInDB, tx?: dbTx) {
	try {
		const dbConnection = tx || db;
		const insertPayload = {
			interviewId: `interview-${generateNanoId()}`,
			applicationId: payload.applicationId,
			roundId: payload.roundId,
			status: payload.status,
			jobDescription: payload.jobDescription,
			resumeText: payload.resumeText,
			questionType: payload.questionType,
			difficulty: payload.difficulty,
			createdAt: new Date(),
			updatedAt: new Date(),
		};
		await dbConnection.insert(interview).values(insertPayload);
		return insertPayload;
	} catch (error) {
		throw new CreateInterviewInDBError("Failed to create interview in DB", { cause: (error as Error).message });
	}
}

export async function updateInterviewInDB(payload: IUpdateInterviewInDB) {
	try {
		const updatePayload = {
			...payload,
			updatedAt: new Date(),
		};
		await db.update(interview).set(updatePayload).where(eq(interview.interviewId, payload.interviewId));
	} catch (error) {
		throw new UpdateInterviewInDBError("Failed to update interview in DB", { cause: (error as Error).message });
	}
}

export async function getInterviewByIdFromDB(interviewId: string) {
	try {
		return await db.select().from(interview).where(eq(interview.interviewId, interviewId));
	} catch (error) {
		throw new GetInterviewByIdFromDBError("Failed to get interview by id from DB", { cause: (error as Error).message });
	}
}
