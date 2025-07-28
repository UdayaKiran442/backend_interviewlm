import { and, eq, gte, inArray, SQL } from "drizzle-orm";
import db from "../db";
import { IFetchScreeningResumesSchema } from "../../routes/v1/screening.route";
import { generateNanoId } from "../../utils/nanoid.utils";
import { applications, candidates, resumeScreening } from "../schema";
import { GetScreeningResumesFromDBError, InsertScreeningResultsToDBError } from "../../exceptions/screening.exceptions";

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
        throw new InsertScreeningResultsToDBError('Failed to insert screening results to DB', { cause: (error as Error).cause });
    }
}

export async function getScreeningResumesFromDB(payload: IFetchScreeningResumesSchema, applicationIds?: string[]) {
    try {
        const selectedFields = {
            screeningId: resumeScreening.screeningId,
            applicationId: resumeScreening.applicationId,
            jobId: resumeScreening.jobId,
            candidateId: resumeScreening.candidateId,
            matchScore: resumeScreening.matchScore,
            feedback: resumeScreening.feedback,
            status: resumeScreening.status,
            createdAt: resumeScreening.createdAt,
            firstName: candidates.firstName,
            lastName: candidates.lastName,
            email: candidates.email,
            phone: candidates.phone,
            location: candidates.location,
        };

        // Start with the base condition for the WHERE clause.
        const conditions = [eq(resumeScreening.jobId, payload.jobId)];

        // Conditionally add more filters to the conditions array.
        if (payload.matchScore) {
            conditions.push(gte(resumeScreening.matchScore, payload.matchScore));
        }

        if (applicationIds && applicationIds.length > 0) {
            conditions.push(inArray(resumeScreening.applicationId, applicationIds));
        }

        // Build the query by applying all conditions at once.
        return await db
            .select(selectedFields)
            .from(resumeScreening)
            .where(and(...conditions))
            .leftJoin(candidates, eq(resumeScreening.candidateId, candidates.candidateId));

    } catch (error) {
        throw new GetScreeningResumesFromDBError('Failed to get screening resumes from DB', { cause: (error as Error).cause });
    }
}