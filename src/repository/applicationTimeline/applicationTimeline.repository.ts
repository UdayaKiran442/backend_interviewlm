import { generateNanoId } from "../../utils/nanoid.utils"
import db from "../db"
import { applicationTimeline } from "../schema"
import { AddApplicationTimelineToDBError, UpdateApplicationTimelineToDBError } from "../../exceptions/applicationTimeline.exceptions";
import { and, eq } from "drizzle-orm";
import { dbTx } from "../db.types";

export async function addApplicationTimelineToDB(payload: { applicationId: string, roundId?: string, title: string, description?: string, status: string }, tx?: dbTx) {
    try {
        const dbConnection = tx || db;
        const insertPayload = {
            applicationTimelineId: `timeline-${generateNanoId()}`,
            applicationId: payload.applicationId,
            roundId: payload.roundId,
            title: payload.title,
            description: payload.description,
            status: payload.status,
            createdAt: new Date(),
            updatedAt: new Date(),
        }
        await dbConnection.insert(applicationTimeline).values(insertPayload)
    } catch (error) {
        throw new AddApplicationTimelineToDBError('Failed to add application timeline to DB', { cause: (error as Error).cause });
    }
}

export async function updateApplicationTimelineToDB(payload: { applicationId: string, roundId: string, title: string, description?: string, status: string }, tx?: dbTx) {
    try {
        const dbConnection = tx || db;
        const updatedPayload = {
            applicationId: payload.applicationId,
            roundId: payload.roundId,
            title: payload.title,
            description: payload.description,
            status: payload.status,
            updatedAt: new Date(),
        }
        await dbConnection.update(applicationTimeline).set(updatedPayload).where(and(eq(applicationTimeline.applicationId,payload.applicationId), eq(applicationTimeline.roundId, payload.roundId)))
    } catch (error) {
        throw new UpdateApplicationTimelineToDBError('Failed to update application timeline to DB', { cause: (error as Error).cause });
    }
}
    