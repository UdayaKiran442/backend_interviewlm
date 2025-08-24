import { eq } from "drizzle-orm";
import { CreateInterviewerInDBError, GetInterviewerByEmailFromDBError } from "../../exceptions/interviewer.exceptions";
import type { IAssignInterviewerSchema } from "../../routes/v1/hr.route";
import { generateNanoId } from "../../utils/nanoid.utils";
import db from "../db";
import { interviewer } from "../schema";

export async function createInterviewerInDB(payload: IAssignInterviewerSchema) {
	try {
		const insertPayload = {
			interviewerId: `interviewer-${generateNanoId()}`,
			companyId: payload.companyId,
			name: payload.name,
			email: payload.email,
			phone: payload.phone,
			jobTitle: payload.jobTitle,
			createdAt: new Date(),
			updatedAt: new Date(),
		};
		await db.insert(interviewer).values(insertPayload);
		return insertPayload;
	} catch (error) {
		throw new CreateInterviewerInDBError("Failed to create interviewer in DB", { cause: (error as Error).message });
	}
}

export async function getInterviewerByEmailFromDB(email: string) {
	try {
		return await db.select().from(interviewer).where(eq(interviewer.email, email));
	} catch (error) {
		throw new GetInterviewerByEmailFromDBError("Failed to get interviewer by email from DB", { cause: (error as Error).message });
	}
}
