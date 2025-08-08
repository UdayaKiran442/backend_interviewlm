import { and, eq } from "drizzle-orm";
import { GetRoundResultFromDBError, InsertRoundResultsToDBError, UpdateRoundResultInDBError } from "../../exceptions/roundResults.exceptions";
import { generateNanoId } from "../../utils/nanoid.utils";
import db from "../db";
import { roundResults } from "../schema";

export async function insertRoundResultsToDB(payload: {
    roundId: string,
    feedback: object,
    applicationId: string,
    verdictBy?: string,
}) {
    try {
        const insertPayload = {
            roundResultId: `roundResult-${generateNanoId()}`,
            roundId: payload.roundId,
            applicationId: payload.applicationId,
            feedback: payload.feedback,
            verdictBy: payload.verdictBy,
            createdAt: new Date(),
            updatedAt: new Date(),
        }

        await db.insert(roundResults).values(insertPayload)
        return insertPayload;
    } catch (error) {
        throw new InsertRoundResultsToDBError('Failed to insert round results to DB', { cause: (error as Error).message });
    }
}

export async function getRoundResultFromDB(payload: { roundId: string, applicationId: string }) {
    try {
        return await db.select().from(roundResults).where(and(eq(roundResults.roundId, payload.roundId), eq(roundResults.applicationId, payload.applicationId)))
    } catch (error) {
        throw new GetRoundResultFromDBError('Failed to get round result by round id and application id', { cause: (error as Error).message });
    }
}

export async function updateRoundResultInDB(payload: { roundId: string, applicationId: string, feedback?: object, verdictBy?: string, isQualified?: boolean }) {
    try {
        const updatedPayload = {
            ...payload,
            updatedAt: new Date()
        }
        await db.update(roundResults).set(updatedPayload).where(and(eq(roundResults.roundId, payload.roundId), eq(roundResults.applicationId, payload.applicationId)))
    } catch (error) {
        throw new UpdateRoundResultInDBError('Failed to update round result in DB', { cause: (error as Error).message });
    }
}