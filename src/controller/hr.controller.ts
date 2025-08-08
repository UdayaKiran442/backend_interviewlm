import { GetJobsByHRError } from "../exceptions/hr.exceptions";
import { GetJobsByHRFromDBError } from "../exceptions/job.exceptions";
import { getJobsByHRFromDB } from "../repository/job/job.repository";

export async function getJobsByHR(hrId: string) {
    try {
        return await getJobsByHRFromDB(hrId)
    } catch (error) {
        if (error instanceof GetJobsByHRFromDBError) {
            throw error;
        }
        throw new GetJobsByHRError('Failed to get jobs by HR', { cause: (error as Error).message });
    }
}