import { generateNanoId } from "../../utils/nanoid.utils";
import db from "../db";
import { resumeScreening } from "../schema";

export async function insertScreeningResultsToDB(payload: { applicationId: string, jobId: string, candidateId: string, matchScore: number }) {
    try {
        const insertPayload = {
            screeningId: `screening-${generateNanoId()}`,
            applicationId: payload.applicationId,
            jobId: payload.jobId,
            candidateId: payload.candidateId,
            matchScore: payload.matchScore,
            createdAt: new Date(),
            updatedAt: new Date(),
        }
        await db.insert(resumeScreening).values(insertPayload)
    } catch (error) {

    }
}