import { AddApplicationTimelineToDBError, UpdateApplicationTimelineToDBError } from "../exceptions/applicationTimeline.exceptions";
import { NotFoundError } from "../exceptions/common.exceptions";
import { GetRoundByIdFromDBError, GetRoundsByJobIdFromDBError } from "../exceptions/round.exceptions";
import { UpdateResumeScreeningInDBError } from "../exceptions/screening.exceptions";
import { updateApplicationTimelineToDB } from "../repository/applicationTimeline/applicationTimeline.repository";
import { updateResumeScreeningInDB } from "../repository/resumeScreening/resumeScreening.repository";
import { getRoundByIdFromDB, getRoundsByJobIdFromDB } from "../repository/rounds/rounds.repository";
import { IQualifyCandidateSchema } from "../routes/v1/round.router";
import { QualifyCandidateError } from "../exceptions/round.exceptions";
import { updateApplicationInDB } from "../repository/application/application.repository";
import { GetApplicationByIdFromDBError, UpdateApplicationInDBError } from "../exceptions/applications.exceptions";
import db from "../repository/db";
import { getJobByIdFromDB, updateJobInDB } from "../repository/job/job.repository";
import { GetJobByIdFromDBError, UpdateJobInDBError } from "../exceptions/job.exceptions";
import { updateRoundResultInDB } from "../repository/roundResults/roundResults.repository";
import { UpdateRoundResultInDBError } from "../exceptions/roundResults.exceptions";
import { createAIInterview } from "./interview.controller";
import { ApplicationTimelineStatus } from "../constants/applicationTimeline.constants";
import { CreateAIInterviewError, CreateInterviewInDBError } from "../exceptions/interview.exceptions";
import { GenerateQuestionsServiceError } from "../exceptions/openai.exceptions";
import { InsertBulkQuestionsInDBError } from "../exceptions/question.exceptions";


export async function qualifyCandidate(payload: IQualifyCandidateSchema) {
    try {
        const result = db.transaction(async (tx: any) => {
            // get round details of roundId
            const [round, job] = await Promise.all([
                getRoundByIdFromDB(payload.roundId),
                getJobByIdFromDB(payload.jobId)
            ])
            if (round.length === 0) {
                throw new NotFoundError('Round not found')
            }
            if (job.length === 0) {
                throw new NotFoundError('Job not found')
            }
            if (payload.screeningId) {
                // get next round details of the job
                const nextRound = await getRoundsByJobIdFromDB(round[0].jobId, round[0].roundNumber + 1);
                if (nextRound.length === 0) {
                    // update application status to qualified or rejected
                    await Promise.all([
                        updateApplicationInDB({
                            applicationId: payload.applicationId,
                            status: payload.isQualified ? 'qualified' : 'rejected'
                        }, tx),
                        updateApplicationTimelineToDB({
                            applicationId: payload.applicationId,
                            roundId: payload.roundId,
                            status: payload.isQualified ? ApplicationTimelineStatus.QUALIFIED : ApplicationTimelineStatus.REJECTED,
                            title: "Resume Screening Completed",
                            description: "Your resume screening has been completed."
                        }, tx),
                        updateRoundResultInDB({
                            roundId: payload.roundId,
                            applicationId: payload.applicationId,
                            verdictBy: payload.hrId,
                            isQualified: payload.isQualified
                        })
                    ])
                    return;
                }

                await Promise.all([
                    // update application timeline
                    updateApplicationTimelineToDB({
                        applicationId: payload.applicationId,
                        roundId: payload.roundId,
                        status: payload.isQualified ? ApplicationTimelineStatus.QUALIFIED : ApplicationTimelineStatus.REJECTED,
                        title: "Resume Screening Completed",
                        description: "Your resume screening has been completed."
                    }, tx),
                    // update in application table
                    payload.isQualified && updateApplicationInDB({
                        applicationId: payload.applicationId,
                        currentRound: nextRound[0].roundId
                    }, tx),
                    // update in resume screening table
                    updateResumeScreeningInDB({
                        screeningId: payload.screeningId,
                        status: 'completed'
                    }, tx),
                    // if qualified update inProgress count in job table
                    payload.isQualified ? updateJobInDB({
                        jobId: job[0].jobId,
                        inProgress: job[0].inProgress + 1
                    }) : updateJobInDB({
                        jobId: job[0].jobId,
                        rejected: job[0].rejected + 1
                    }),
                    updateRoundResultInDB({
                        roundId: payload.roundId,
                        applicationId: payload.applicationId,
                        verdictBy: payload.hrId,
                        isQualified: payload.isQualified
                    })
                ])
                if (!payload.isQualified) {
                    // update application status to rejected
                    await updateApplicationInDB({
                        applicationId: payload.applicationId,
                        status: 'rejected'
                    }, tx)
                    // TODO: send email to candidate
                }

                // if next is interview round and is taken by ai then create interview for the candidate
                if (payload.isQualified && nextRound[0].roundType === 'Technical Interview' && nextRound[0].isAI) {
                    await createAIInterview({
                        applicationId: payload.applicationId,
                        hrId: payload.hrId,
                        difficulty: nextRound[0].difficulty,
                        questionType: nextRound[0].questionType,
                        jobDescription: job[0].jobDescription
                    })
                }
            }
            return;
        })
    } catch (error) {
        if (error instanceof GetRoundByIdFromDBError || error instanceof NotFoundError || error instanceof GetRoundsByJobIdFromDBError || error instanceof UpdateApplicationTimelineToDBError || error instanceof UpdateResumeScreeningInDBError || error instanceof UpdateApplicationInDBError || error instanceof GetJobByIdFromDBError || error instanceof UpdateJobInDBError || error instanceof UpdateRoundResultInDBError || error instanceof CreateInterviewInDBError || error instanceof GetApplicationByIdFromDBError || error instanceof GenerateQuestionsServiceError || error instanceof InsertBulkQuestionsInDBError || error instanceof AddApplicationTimelineToDBError || error instanceof CreateAIInterviewError) {
            throw error
        }
        throw new QualifyCandidateError('Failed to qualify candidate', { cause: (error as Error).message });
    }
}
