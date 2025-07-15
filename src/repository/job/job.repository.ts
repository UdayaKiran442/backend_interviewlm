import { generateNanoId } from "../../utils/nanoid.utils";
import db from "../db";
import { jobs } from "../schema";
import { CloseJobInDBError, CreateJobInDBError } from "../../exceptions/job.exceptions";
import { ICreatJobInDB } from "../../types/types";
import { eq } from "drizzle-orm";
import { GetJobByIdError } from "../../exceptions/job.exceptions";

export async function createJobInDB(payload: ICreatJobInDB) {
    try {
        const insertPayload = {
            jobId: `job-${generateNanoId()}`,
            hrId: payload.hrId,
            jobTitle: payload.jobTitle,
            jobDescription: payload.jobDescription,
            department: payload.department,
            package: payload.package,
            maximumApplications: payload.maximumApplications,
            companyId: payload.companyId,
        }
        await db.insert(jobs).values(insertPayload)
        return insertPayload;
    } catch (error) {
        throw new CreateJobInDBError('Failed to create job in DB', { cause: (error as Error).cause });
    }
}

export async function getJobById(jobId: string) {
    try {
       return await db.select().from(jobs).where(eq(jobs.jobId, jobId))
    } catch (error) {
        throw new GetJobByIdError('Failed to get job by id', { cause: (error as Error).cause });
    }
}

export async function closeJobInDB(jobId: string) {
    try {
        await db.update(jobs).set({ isJobOpen: false }).where(eq(jobs.jobId, jobId))
    } catch (error) {
        throw new CloseJobInDBError('Failed to close job', { cause: (error as Error).cause });
    }
}
    