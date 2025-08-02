import { AddApplicationToDBError, CheckCandidateAppliedInDBError, GetApplicationsByJobIdFromDBError, GetApplicationsForJobError } from "../exceptions/applications.exceptions";
import { ApplyJobError, JobAlreadyAppliedError } from "../exceptions/applications.exceptions";
import { AddApplicationTimelineToDBError } from "../exceptions/applicationTimeline.exceptions";
import { UpdateCandidateJobsInDBError } from "../exceptions/candidate.exceptions";
import { NotFoundError } from "../exceptions/common.exceptions";
import { CloseJobInDBError, GetJobByIdError, JobClosedError, UpdateJobApplicationsCountInDBError } from "../exceptions/job.exceptions";
import { GenerateEmbeddingsServiceError, GenerateResumeSummaryServiceError } from "../exceptions/openai.exceptions";
import { QueryVectorEmbeddingsServiceError, UpsertVectorEmbeddingsError, UpsertVectorEmbeddingsServiceError } from "../exceptions/pinecone.exceptions";
import { GetRoundsByJobIdFromDBError } from "../exceptions/round.exceptions";
import { InsertScreeningResultsToDBError } from "../exceptions/screening.exceptions";
import { addApplicationToDB, checkCandidateAppliedInDB, getApplicationsByJobIdFromDB } from "../repository/application/application.repository";
import { addApplicationTimelineToDB } from "../repository/applicationTimeline/applicationTimeline.repository";
import { getCandidateByIDFromDB, updateCandidateJobsInDB } from "../repository/candidate/candidate.repository";
import db from "../repository/db";
import { closeJobInDB, getJobByIdFromDB, updateJobApplicationsCountInDB } from "../repository/job/job.repository";
import { insertScreeningResultsToDB } from "../repository/resumeScreening/resumeScreening.repository";
import { getRoundsByJobIdFromDB } from "../repository/rounds/rounds.repository";
import { IApplyJobSchema, IGetApplicationsForJobSchema } from "../routes/v1/applicatons.route";
import { generateResumeSummary } from "../services/openai.service";
import { queryVectorEmbeddingsService } from "../services/pinecone.service";
import { ActiveConfig } from "../utils/config.utils";
import { upsertVectorEmbeddings } from "../utils/upsertVectorDb.utils";

export async function applyJob(payload: IApplyJobSchema) {
    try {
        const result = db.transaction(async (tx: any) => {
            const [job, rounds, application, resumeSummary] = await Promise.all([
                getJobByIdFromDB(payload.jobId),
                getRoundsByJobIdFromDB(payload.jobId),
                checkCandidateAppliedInDB({ candidateId: payload.candidateId, jobId: payload.jobId }),
                generateResumeSummary(payload.resumeText)
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
            if (resumeSummary.skills.length > 0) {
                payload.skills = resumeSummary.skills
            }

            // apply to job
            const newApplication = await addApplicationToDB(payload, tx)

            // update job applications count
            const newCount = job[0].applications + 1
            // TODO: run in background
            await updateJobApplicationsCountInDB({ jobId: payload.jobId, count: newCount }, tx)

            // update candidate jobs
            const candidate = await getCandidateByIDFromDB(payload.candidateId, tx)
            const jobs = candidate[0].jobs as string[]
            const newJobs = [...jobs, payload.jobId]
            // TODO: run in background
            await updateCandidateJobsInDB({ candidateId: payload.candidateId, jobs: newJobs }, tx)

            // add to application timeline
            // TODO: run in background
            if (newApplication) {
                await addApplicationTimelineToDB({
                    applicationId: newApplication.applicationId,
                    description: "Your application has been received and is under review.",
                    status: "applied",
                    title: "Application Submitted",
                }, tx)
                await addApplicationTimelineToDB({
                    applicationId: newApplication.applicationId,
                    title: "Resume Under Review",
                    status: "pending",
                    description: "Your resume is under review.",
                    roundId: newApplication.currentRound,
                }, tx)
                // TODO: run in background
                const resumeEmbeddings = await upsertVectorEmbeddings({
                    indexName: ActiveConfig.RESUME_INDEX,
                    text: resumeSummary.summary,
                    metadata: {
                        applicationId: newApplication.applicationId,
                        resumeText: payload.resumeText,
                        summary: resumeSummary.summary,
                        skills: resumeSummary.skills,
                        jobId: payload.jobId,
                    }
                })
                const matchScore = await queryVectorEmbeddingsService({
                    indexName: ActiveConfig.JD_INDEX,
                    vector: resumeEmbeddings ?? [],
                    jobId: payload.jobId
                })
                // add in resume screening table
                await insertScreeningResultsToDB({
                    applicationId: newApplication.applicationId,
                    candidateId: payload.candidateId,
                    jobId: payload.jobId,
                    matchScore: matchScore?.matches[0].score ?? 0,
                    roundId: payload.currentRoundId
                }, tx)
            }
            // check maximum applications and close job if limit is reached
            if (job[0].maximumApplications && job[0].applications >= job[0].maximumApplications) {
                await closeJobInDB(payload.jobId)
            }
            return newApplication;
        })
        return result;
    } catch (error) {
        if (error instanceof NotFoundError || error instanceof JobClosedError || error instanceof JobAlreadyAppliedError || error instanceof CloseJobInDBError || error instanceof AddApplicationToDBError || error instanceof CheckCandidateAppliedInDBError || error instanceof UpsertVectorEmbeddingsServiceError || error instanceof GenerateEmbeddingsServiceError || error instanceof UpsertVectorEmbeddingsError || error instanceof InsertScreeningResultsToDBError || error instanceof QueryVectorEmbeddingsServiceError || error instanceof UpdateJobApplicationsCountInDBError || error instanceof GetJobByIdError || error instanceof GetRoundsByJobIdFromDBError || error instanceof GenerateResumeSummaryServiceError || error instanceof UpdateCandidateJobsInDBError || error instanceof AddApplicationTimelineToDBError) {
            throw error;
        }
        throw new ApplyJobError('Failed to apply for job', { cause: (error as Error).cause });
    }
}

export async function getApplicationsForJob(payload: IGetApplicationsForJobSchema) {
    try {
        const result = await getApplicationsByJobIdFromDB(payload.jobId)
        return result;
    } catch (error) {
        if (error instanceof GetApplicationsByJobIdFromDBError) {
            throw error;
        }
        throw new GetApplicationsForJobError('Failed to get applications for job', { cause: (error as Error).cause });
    }
}