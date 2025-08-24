import { eq } from "drizzle-orm";
import { CreateHRInDBError, GetHRByEmailFromDBError, GetHRByUserIdFromDBError, GetHRFromDBError } from "../../exceptions/hr.exceptions";
import { generateNanoId } from "../../utils/nanoid.utils";
import db from "../db";
import { hr } from "../schema";

export async function createHRInDB(payload: { companyId: string; name: string; email: string; phone: string; isOrgAdmin: boolean; userId: string }) {
	try {
		const insertPayload = {
			hrId: `hr-${generateNanoId()}`,
			companyId: payload.companyId,
			userId: payload.userId,
			name: payload.name,
			email: payload.email,
			phone: payload.phone,
			isOrgAdmin: payload.isOrgAdmin,
			createdAt: new Date(),
			updatedAt: new Date(),
		};
		await db.insert(hr).values(insertPayload);
	} catch (error) {
		throw new CreateHRInDBError("Failed to create HR in DB", { cause: (error as Error).message });
	}
}

export async function getHRFromDB(hrId: string) {
	try {
		return await db.select().from(hr).where(eq(hr.hrId, hrId));
	} catch (error) {
		throw new GetHRFromDBError("Failed to get HR from DB", { cause: (error as Error).message });
	}
}

export async function getHRByUserIdFromDB(userId: string) {
	try {
		return await db.select().from(hr).where(eq(hr.userId, userId));
	} catch (error) {
		throw new GetHRByUserIdFromDBError("Failed to get HR by user id from DB", { cause: (error as Error).message });
	}
}

export async function getHRByEmailFromDB(email: string) {
	try {
		return await db.select().from(hr).where(eq(hr.email, email));
	} catch (error) {
		throw new GetHRByEmailFromDBError("Failed to get HR by email from DB", { cause: (error as Error).message });
	}
}
