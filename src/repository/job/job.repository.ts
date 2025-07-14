import { generateNanoId } from "../../utils/nanoid.utils";
import db from "../db";
import { jobs } from "../schema";
import { CreateJobInDBError } from "../../exceptions/job.exceptions";
import { ICreatJobInDB } from "../../types/types";

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