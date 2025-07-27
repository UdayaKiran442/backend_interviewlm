import { and, eq, gte } from "drizzle-orm";
import db from "../db";
import { IFetchScreeningResumesSchema } from "../../routes/v1/screening.route";
import { generateNanoId } from "../../utils/nanoid.utils";
import { applications, candidates, resumeScreening } from "../schema";
import { GetScreeningResumesFromDBError } from "../../exceptions/round.exceptions";

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

export async function getScreeningResumesFromDB(payload: IFetchScreeningResumesSchema) {
    try {
        let query = db.select().from(resumeScreening).where(eq(resumeScreening.jobId, payload.jobId));
        if (payload.matchScore) {
            query = db.select().from(resumeScreening).where(and(eq(resumeScreening.jobId, payload.jobId), gte(resumeScreening.matchScore, payload.matchScore)));
        }
        return await query.leftJoin(candidates, eq(resumeScreening.candidateId, candidates.candidateId));
    } catch (error) {
        throw new GetScreeningResumesFromDBError('Failed to get screening resumes from DB', { cause: (error as Error).cause });
    }
}