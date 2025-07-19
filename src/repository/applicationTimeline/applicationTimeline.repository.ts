import { generateNanoId } from "../../utils/nanoid.utils"
import db from "../db"
import { applicationTimeline } from "../schema"

export async function addApplicationTimelineToDB(payload: { applicationId: string, roundId?: string, title: string, description?: string, status: string }) {
    try {
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
        await db.insert(applicationTimeline).values(insertPayload)
    } catch (error) {

    }
}