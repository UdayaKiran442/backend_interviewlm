import { ApplyJobError, JobAlreadyAppliedError } from "../exceptions/applications.exceptions";
import { NotFoundError } from "../exceptions/common.exceptions";
import { CloseJobInDBError, JobClosedError } from "../exceptions/job.exceptions";
import { addApplicationToDB, checkIfCandidateHasAlreadyAppliedForJob } from "../repository/application/application.repository";
import { addApplicationTimelineToDB } from "../repository/applicationTimeline/applicationTimeline.repository";
import { getCandidateByIDFromDB, updateCandidateJobsInDB } from "../repository/candidate/candidate.repository";
import { closeJobInDB, getJobByIdFromDB, updateJobApplicationsCountInDB } from "../repository/job/job.repository";
import { getRoundsByJobIdFromDB } from "../repository/rounds/rounds.repository";
import { IApplyJobSchema } from "../routes/v1/applicatons.route";

export async function applyJob(payload: IApplyJobSchema) {
    try {
        const [job, rounds, application] = await Promise.all([
            getJobByIdFromDB(payload.jobId),
            getRoundsByJobIdFromDB(payload.jobId),
            checkIfCandidateHasAlreadyAppliedForJob({ candidateId: payload.candidateId, jobId: payload.jobId })
        ])

        // check if the job exists
        if (job.length === 0) {
            throw new NotFoundError('Job not found');
        }

        // check if the job is open
        if (!job[0].isJobOpen) {
            throw new JobClosedError('Job is closed');
        }

        // check if the candidate has already applied for the job
        if (application && application.length > 0) {
            throw new JobAlreadyAppliedError('You have already applied for this job');
        }

        // set current round
        if (rounds && rounds.length > 0) {
            payload.currentRoundId = rounds[0].roundId
        }

        // apply to job
        const newApplication = await addApplicationToDB(payload)

        // update job applications count
        const newCount = job[0].applications + 1
        // TODO: run in background
        await updateJobApplicationsCountInDB({ jobId: payload.jobId, count: newCount })

        // update candidate jobs
        const candidate = await getCandidateByIDFromDB(payload.candidateId)
        const jobs = candidate[0].jobs as string[]
        const newJobs = [...jobs, payload.jobId]
        // TODO: run in background
        await updateCandidateJobsInDB({ candidateId: payload.candidateId, jobs: newJobs })

        // add to application timeline
        // TODO: run in background
        if (newApplication) {
            await addApplicationTimelineToDB({
                applicationId: newApplication.applicationId,
                description: "Your application has been received and is under review.",
                status: "applied",
                title: "Application Submitted",
            })
            await addApplicationTimelineToDB({
                applicationId: newApplication.applicationId,
                title: "Resume Under Review",
                status: "pending",
                description: "Your resume is under review.",
                roundId: newApplication.currentRound,
            })
        }
        // check maximum applications and close job if limit is reached
        if (job[0].maximumApplications && job[0].applications >= job[0].maximumApplications) {
            await closeJobInDB(payload.jobId)
        }
        return newApplication;
    } catch (error) {
        if (error instanceof NotFoundError || error instanceof JobClosedError || error instanceof JobAlreadyAppliedError || error instanceof CloseJobInDBError) {
            throw error;
        }
        throw new ApplyJobError('Failed to apply for job', { cause: (error as Error).cause });
    }
}