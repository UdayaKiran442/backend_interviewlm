import { eq } from "drizzle-orm";
import { CreateReviewerInDBError, GetReviewerByEmailFromDBError } from "../../exceptions/reviewer.exceptions";
import type { IAssignReviewerSchema } from "../../routes/v1/hr.route";
import { generateNanoId } from "../../utils/nanoid.utils";
import db from "../db";
import { reviewer } from "../schema";

export async function createReviewerInDB(payload: IAssignReviewerSchema) {
	try {
		const insertPayload = {
			reviewerId: `reviewer-${generateNanoId()}`,
			companyId: payload.companyId,
			name: payload.name,
			email: payload.email,
			phone: payload.phone,
			jobTitle: payload.jobTitle,
			createdAt: new Date(),
			updatedAt: new Date(),
		};
		await db.insert(reviewer).values(insertPayload);
		return insertPayload;
	} catch (error) {
		throw new CreateReviewerInDBError("Failed to create reviewer in DB", { cause: (error as Error).message });
	}
}

export async function getReviewerByEmailFromDB(email: string) {
	try {
		return await db.select().from(reviewer).where(eq(reviewer.email, email));
	} catch (error) {
		throw new GetReviewerByEmailFromDBError("Failed to get reviewer by email from DB", { cause: (error as Error).message });
	}
}
