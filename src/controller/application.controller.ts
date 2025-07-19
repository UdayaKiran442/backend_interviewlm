import { NotFoundError } from "../exceptions/common.exceptions";
import { addApplicationToDB, checkIfCandidateHasAlreadyAppliedForJob } from "../repository/application/application.repository";
import { addApplicationTimelineToDB } from "../repository/applicationTimeline/applicationTimeline.repository";
import { getCandidateByIDFromDB, updateCandidateJobsInDB } from "../repository/candidate/candidate.repository";
import { getJobByIdFromDB, updateJobApplicationsCountInDB } from "../repository/job/job.repository";
import { getRoundsByJobIdFromDB } from "../repository/rounds/rounds.repository";
import { IApplyJobSchema } from "../routes/v1/applicatons.route";

export async function applyJob(payload: IApplyJobSchema) {
    try {
        // check if the job is open
        const job = await getJobByIdFromDB(payload.jobId)
        if (job.length === 0) {
            throw new NotFoundError('Job not found');
        }
        if(!job[0].isJobOpen){
        }

        // check if the candidate has already applied for the job
        const application = await checkIfCandidateHasAlreadyAppliedForJob({candidateId: payload.candidateId, jobId: payload.jobId})
        if(application && application.length > 0){
        }

        const jobRounds = await getRoundsByJobIdFromDB(payload.jobId)
        if(jobRounds && jobRounds.length > 0){
            payload.currentRoundId = jobRounds[0].roundId
        }

        // apply to job
        const newApplication = await addApplicationToDB(payload)

        // update job applications count
        // TODO: run in background
        const newCount = job[0].applications + 1
        await updateJobApplicationsCountInDB({jobId: payload.jobId, count: newCount})

        // update candidate jobs
        // TODO: run in background
        const candidate = await getCandidateByIDFromDB(payload.candidateId)
        const jobs = candidate[0].jobs as string[]
        const newJobs = [...jobs, payload.jobId]
        await updateCandidateJobsInDB({candidateId: payload.candidateId, jobs: newJobs})        

        // add to application timeline
        // TODO: run in background
        if(newApplication){
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
        return newApplication;
    } catch (error) {

    }
}