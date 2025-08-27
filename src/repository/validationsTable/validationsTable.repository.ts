import { InsertValidationInDBError } from "../../exceptions/validationsTable.exceptions";
import type { IInsertValidationInDB } from "../../types/types";
import { generateNanoId } from "../../utils/nanoid.utils";
import db from "../db";
import { validationTable } from "../schema";

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
