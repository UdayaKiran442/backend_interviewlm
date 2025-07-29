import { and, eq, gte } from "drizzle-orm";
import db from "../db";
import { IFetchResumeScreeningDetailsSchema, IFetchScreeningResumesSchema } from "../../routes/v1/screening.route";
import { generateNanoId } from "../../utils/nanoid.utils";
import { applications, candidates, jobs, resumeScreening } from "../schema";
import { GetResumeScreeningDetailsFromDBError, GetScreeningResumesFromDBError, InsertScreeningResultsToDBError, UpdateFeedbackInDBError } from "../../exceptions/screening.exceptions";

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

export async function getScreeningResumesFromDB(payload: IFetchScreeningResumesSchema) {
    try {
        const selectedFields = {
            screeningId: resumeScreening.screeningId,
            applicationId: resumeScreening.applicationId,
            jobId: resumeScreening.jobId,
            candidateId: resumeScreening.candidateId,
            matchScore: resumeScreening.matchScore,
            feedback: resumeScreening.feedback,
            status: resumeScreening.status,
            appliedAt: resumeScreening.createdAt,
            firstName: candidates.firstName,
            lastName: candidates.lastName,
            email: candidates.email,
            phone: candidates.phone,
            experience: candidates.experience,
            location: candidates.location,
            skills: applications.skills,
        };

        // Start with the base condition for the WHERE clause.
        const conditions = [eq(resumeScreening.jobId, payload.jobId)];

        // Conditionally add more filters to the conditions array.
        if (payload.matchScore) {
            conditions.push(gte(resumeScreening.matchScore, payload.matchScore));
        }

        // Build the query by applying all conditions at once.
        return await db
            .select(selectedFields)
            .from(resumeScreening)
            .where(and(...conditions))
            .leftJoin(candidates, eq(resumeScreening.candidateId, candidates.candidateId))
            .leftJoin(applications, eq(resumeScreening.applicationId, applications.applicationId));

    } catch (error) {
        throw new GetScreeningResumesFromDBError('Failed to get screening resumes from DB', { cause: (error as Error).cause });
    }
}

export async function getResumeScreeningDetailsFromDB(payload: IFetchResumeScreeningDetailsSchema) {
    try {
        return await db.select({
            screeningId: resumeScreening.screeningId,
            applicationId: resumeScreening.applicationId,
            jobId: resumeScreening.jobId,
            candidateId: resumeScreening.candidateId,
            matchScore: resumeScreening.matchScore,
            feedback: resumeScreening.feedback,
            status: resumeScreening.status,
            appliedAt: resumeScreening.createdAt,
            jobDescription: jobs.jobDescription,
            resumeText: applications.resumeText,
        }).from(resumeScreening).where(eq(resumeScreening.screeningId, payload.screeningId)).leftJoin(jobs, eq(resumeScreening.jobId, jobs.jobId)).leftJoin(applications, eq(resumeScreening.applicationId, applications.applicationId))
    } catch (error) {
        throw new GetResumeScreeningDetailsFromDBError('Failed to get resume screening details from DB', { cause: (error as Error).cause });
    }
}

export async function updateFeedbackInDB(payload:{screeningId: string, feedback: object}){
    try {
        await db.update(resumeScreening).set({feedback: payload.feedback, updatedAt: new Date()}).where(eq(resumeScreening.screeningId, payload.screeningId))
    } catch (error) {
        throw new UpdateFeedbackInDBError('Failed to update feedback in DB', { cause: (error as Error).cause });
    }
}