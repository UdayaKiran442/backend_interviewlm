import { generateNanoId } from "../../utils/nanoid.utils";
import db from "../db";
import { jobs } from "../schema";
import { CloseJobInDBError, CreateJobInDBError, GetJobsByHRFromDBError, UpdateJobApplicationsCountInDBError, UpdateJobInDBError } from "../../exceptions/job.exceptions";
import type { ICreatJobInDB } from "../../types/types";
import { eq } from "drizzle-orm";
import { GetJobByIdFromDBError } from "../../exceptions/job.exceptions";
import type { dbTx } from "../db.types";

export async function createJobInDB(payload: ICreatJobInDB, tx?: dbTx) {
    try {
        const dbConnection = tx || db;
        const insertPayload = {
            jobId: `job-${generateNanoId()}`,
            hrId: payload.hrId,
            jobTitle: payload.jobTitle,
            jobDescription: payload.jobDescription,
            department: payload.department,
            package: payload.package,
            maximumApplications: payload.maximumApplications,
            companyId: payload.companyId,
            location: payload.location
        }
        await dbConnection.insert(jobs).values(insertPayload)
        return insertPayload;
    } catch (error) {
        throw new CreateJobInDBError('Failed to create job in DB', { cause: (error as Error).message });
    }
}

export async function getJobByIdFromDB(jobId: string, tx?: dbTx) {
    try {
        const dbConnection = tx || db;
        return await dbConnection.select().from(jobs).where(eq(jobs.jobId, jobId))
    } catch (error) {
        throw new GetJobByIdFromDBError('Failed to get job by id', { cause: (error as Error).message });
    }
}

export async function closeJobInDB(jobId: string) {
    try {
        await db.update(jobs).set({ isJobOpen: false, updatedAt: new Date() }).where(eq(jobs.jobId, jobId))
    } catch (error) {
        throw new CloseJobInDBError('Failed to close job', { cause: (error as Error).message });
    }
}

export async function updateJobApplicationsCountInDB(payload: { jobId: string, count: number }, tx?: dbTx) {
    try {
        const dbConnection = tx || db;
        await dbConnection.update(jobs).set({ applications: payload.count, updatedAt: new Date() }).where(eq(jobs.jobId, payload.jobId))
    } catch (error) {
        throw new UpdateJobApplicationsCountInDBError('Failed to update job applications count', { cause: (error as Error).message });
    }
}

export async function updateJobInDB(payload: { jobId: string, hrId?: string, jobTitle?: string, jobDescription?: string, department?: string, package?: string, maximumApplications?: number, companyId?: string, applications?: number, inProgress?: number, rejected?: number, interviewing?: number, hired?: number, isJobOpen?: boolean, isScreeningDone?: boolean }, tx?: dbTx) {
    try {
        const dbConnection = tx || db;
        const updatedPayload = {
            ...payload,
            updatedAt: new Date()
        }
        await dbConnection.update(jobs).set(updatedPayload).where(eq(jobs.jobId, payload.jobId))
    } catch (error) {
        throw new UpdateJobInDBError('Failed to update job in DB', { cause: (error as Error).message });
    }
}

export async function getJobsByHRFromDB(hrId: string) {
    try {
        return await db.select().from(jobs).where(eq(jobs.hrId, hrId))
    } catch (error) {
        throw new GetJobsByHRFromDBError('Failed to get jobs by HR', { cause: (error as Error).message });
    }
}
