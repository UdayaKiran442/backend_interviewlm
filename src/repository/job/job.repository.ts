import { generateNanoId } from "../../utils/nanoid.utils";
import db from "../db";
import { jobs } from "../schema";
import { CreateJobInDBError } from "../../exceptions/job.exceptions";

export async function createJobInDB(payload: { hrId: string, jobTitle: string, jobDescription: string, department: string, package: string | undefined, maximumApplications: number | undefined, companyName: string, location: string }) {
    try {
        const insertPayload = {
            jobId: `job-${generateNanoId()}`,
            hrId: payload.hrId,
            jobTitle: payload.jobTitle,
            jobDescription: payload.jobDescription,
            department: payload.department,
            package: payload.package,
            maximumApplications: payload.maximumApplications,
            companyName: payload.companyName,
            location: payload.location,
        }
        await db.insert(jobs).values(insertPayload)
        return insertPayload;
    } catch (error) {
        throw new CreateJobInDBError('Failed to create job in DB', { cause: (error as Error).cause });
    }
}