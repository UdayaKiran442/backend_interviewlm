import db from "../db";
import { interview } from "../schema";
import type { dbTx } from "../db.types";
import { CreateInterviewInDBError } from "../../exceptions/interview.exceptions";
import type { ICreateInterviewSchema } from "../../routes/v1/interview.route";
import { generateNanoId } from "../../utils/nanoid.utils";
import { InterviewStatus } from "../../constants/interview.constants";

export async function createInterviewInDB(payload: ICreateInterviewSchema, tx?: dbTx) {
	try {
		const dbConnection = tx || db;
		const insertPayload = {
			interviewId: `interview-${generateNanoId()}`,
			applicationId: payload.applicationId,
			roundId: payload.roundId,
			status: InterviewStatus.PENDING,
			createdAt: new Date(),
			updatedAt: new Date(),
		};
		await dbConnection.insert(interview).values(insertPayload);
		return insertPayload;
	} catch (error) {
		throw new CreateInterviewInDBError("Failed to create interview in DB", { cause: (error as Error).message });
	}
}
