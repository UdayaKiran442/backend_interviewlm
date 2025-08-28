import { eq } from "drizzle-orm";
import { InsertValidationInDBError, UpdateValidationInDBError } from "../../exceptions/validationsTable.exceptions";
import type { IInsertValidationInDB, IUpdateValidationInDB } from "../../types/types";
import { generateNanoId } from "../../utils/nanoid.utils";
import db from "../db";
import { validationTable } from "../schema";
import type { dbTx } from "../db.types";

export async function insertValidationInDB(payload: IInsertValidationInDB) {
	try {
		const insertPayload = {
			validationId: `validation-${generateNanoId()}`,
			interviewId: payload.interviewId,
			jobId: payload.jobId,
			roundId: payload.roundId,
			roundResultId: payload.roundResultId,
			status: payload.status,
		};
		await db.insert(validationTable).values(insertPayload);
		return insertPayload;
	} catch (error) {
		throw new InsertValidationInDBError("Failed to insert validation in DB", { cause: (error as Error).message });
	}
}

export async function updateValidationInDB(payload: IUpdateValidationInDB, tx?: dbTx) {
	try {
		const dbConnection = tx || db;
		const updatedPayload = {
			...payload,
			updatedAt: new Date(),
		};
		await dbConnection.update(validationTable).set(updatedPayload).where(eq(validationTable.validationId, payload.validationId));
	} catch (error) {
		throw new UpdateValidationInDBError("Failed to update validation in DB", { cause: (error as Error).message });
	}
}
