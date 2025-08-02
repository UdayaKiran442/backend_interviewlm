import { IApplyJobSchema } from "../../routes/v1/applicatons.route";
import { generateNanoId } from "../../utils/nanoid.utils";
import db from "../db";
import { applications } from "../schema";
import { and, eq } from "drizzle-orm";
import { AddApplicationToDBError, CheckCandidateAppliedInDBError, GetApplicationsByJobIdFromDBError, UpdateApplicationInDBError } from "../../exceptions/applications.exceptions";
import { dbTx } from "../db.types";

export async function addApplicationToDB(payload: IApplyJobSchema, tx?: dbTx) {
    try {
        const dbConnection = tx || db;
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
        await dbConnection.insert(applications).values(insertPayload)
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


export async function updateApplicationInDB(payload: {
    applicationId: string,
    candidateId?: string,
    jobId?: string,
    resumeLink?: string,
    coverLetterLink?: string,
    status?: string,
    currentRound?: string,
    resumeText?: string,
    coverLetterText?: string,
    skills?: string[],
}, tx?: dbTx){
    try {
        const dbConnection = tx || db;
        const updatedPayload = {
            ...payload,
            updatedAt: new Date(),
        }
        await dbConnection.update(applications).set(updatedPayload).where(eq(applications.applicationId, payload.applicationId))
    } catch (error) {
        throw new UpdateApplicationInDBError('Failed to update application in DB', { cause: (error as Error).cause });
    }
}

export async function getApplicationsByJobIdFromDB(jobId: string) {
    try {
        return await db.select().from(applications).where(eq(applications.jobId, jobId))
    } catch (error) {
        console.log(error)
        throw new GetApplicationsByJobIdFromDBError('Failed to get applications by job id from DB', { cause: (error as Error).cause });
    }
}
    