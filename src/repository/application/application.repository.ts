import { IApplyJobSchema } from "../../routes/v1/applicatons.route";
import { generateNanoId } from "../../utils/nanoid.utils";
import db from "../db";
import { applications } from "../schema";
import { and, eq } from "drizzle-orm";
import { AddApplicationToDBError, CheckCandidateAppliedInDBError, UpdateApplicationRoundToDBError, UpdateApplicationStatusInDBError } from "../../exceptions/applications.exceptions";

export async function addApplicationToDB(payload: IApplyJobSchema) {
    try {
        const insertPayload = {
            applicationId: `application-${generateNanoId()}`,
            candidateId: payload.candidateId,
            jobId: payload.jobId,
            resumeLink: payload.resumeLink,
            coverLetterLink: payload.coverLetterLink,
            status: "applied",
            currentRound: payload.currentRoundId,
            resumeText: payload.resumeText,
            coverLetterText: payload.coverLetterText,
            skills: payload.skills,
            createdAt: new Date(),
            updatedAt: new Date(),
        }
        await db.insert(applications).values(insertPayload)
        return insertPayload;
    } catch (error) {
        throw new AddApplicationToDBError('Failed to add application to DB', { cause: (error as Error).cause });
    }
}

export async function checkCandidateAppliedInDB(payload: { candidateId: string, jobId: string }) {
    try {
        return await db.select().from(applications).where(and(eq(applications.candidateId, payload.candidateId), eq(applications.jobId, payload.jobId)))
    } catch (error) {
        throw new CheckCandidateAppliedInDBError('Failed to check if candidate has already applied for job', { cause: (error as Error).cause });
    }
}

export async function updateApplicationRoundToDB(payload: { applicationId: string, roundId: string}) {
    try {
        await db.update(applications).set({currentRound: payload.roundId, updatedAt: new Date()}).where(eq(applications.applicationId, payload.applicationId))
    } catch (error) {
        throw new UpdateApplicationRoundToDBError('Failed to update application round to DB', { cause: (error as Error).cause });
    }
}

export async function updateApplicationStatusInDB(payload: {applicationId: string, status: string}){
    try {
        await db.update(applications).set({status: payload.status, updatedAt: new Date()}).where(eq(applications.applicationId, payload.applicationId))
    } catch (error) {
        throw new UpdateApplicationStatusInDBError('Failed to update application status in DB', { cause: (error as Error).cause });
    }
}