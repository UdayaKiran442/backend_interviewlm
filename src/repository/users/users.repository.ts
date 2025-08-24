import db from "../db";
import { users } from "../schema";
import { eq } from "drizzle-orm";
import { AddUserInDBError, GetUserByEmailFromDBError, UpdateUserInDBError } from "../../exceptions/user.exceptions";
import type { IAuthSchema } from "../../routes/v1/auth.route";
import type { IUpdateUserInDB } from "../../types/types";

export async function getUserByEmailFromDB(email: string) {
	try {
		return await db.select().from(users).where(eq(users.email, email));
	} catch (error) {
		throw new GetUserByEmailFromDBError("Failed to get user by email from DB", { cause: (error as Error).message });
	}
}

export async function addUserInDB(payload: IAuthSchema) {
	try {
		const insertPayload = {
			userId: payload.userId,
			email: payload.email,
			roles: [payload.role],
			createdAt: new Date(),
			updatedAt: new Date(),
		};
		await db.insert(users).values(insertPayload);
	} catch (error) {
		throw new AddUserInDBError("Failed to add user in DB", { cause: (error as Error).message });
	}
}

export async function updateUserInDB(payload: IUpdateUserInDB) {
	try {
		const updatedPayload = {
			...payload,
			updatedAt: new Date(),
		};
		return await db.update(users).set(updatedPayload).where(eq(users.userId, payload.userId));
	} catch (error) {
		throw new UpdateUserInDBError("Failed to update user in DB", { cause: (error as Error).message });
	}
}
