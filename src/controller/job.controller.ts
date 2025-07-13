import { CreateJobInDBError } from "../exceptions/job.exceptions";
import { createJobInDB } from "../repository/job/job.repository";
import { ICreateJobSchema } from "../routes/job.route";
import { createRoundInDB } from "../repository/rounds/rounds.repository";
import { CreateRoundInDBError } from "../exceptions/round.exceptions";

export async function createJob(payload: ICreateJobSchema) {
    try {
        // create job
        const newJob = await createJobInDB({
            companyId: payload.companyId,
            department: payload.department,
            hrId: payload.hrId,
            jobDescription: payload.jobDescription,
            jobTitle: payload.jobTitle,
            maximumApplications: payload.maximumApplications,
            package: payload.package,
        })

        // add rounds in db
        const newRounds = await createRoundInDB(payload.rounds.map((round) => {
            return {
                jobId: newJob.jobId,
                roundNumber: round.roundNumber,
                roundType: round.roundType,
                questionType: round.questionType,
                duration: round.duration,
                difficulty: round.difficulty,
                roundDescription: round.roundDescription,
                isAI: round.isAI,
            }
        }))

        // return job
        return {
            job: newJob,
            rounds: newRounds,
        }
    } catch (error) {
        if (error instanceof CreateJobInDBError || error instanceof CreateRoundInDBError) {
            throw error;
        }
    }
}