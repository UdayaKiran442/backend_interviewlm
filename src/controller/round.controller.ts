import { UpdateApplicationRoundToDBError, UpdateApplicationStatusInDBError } from "../exceptions/applications.exceptions";
import { UpdateApplicationTimelineToDBError } from "../exceptions/applicationTimeline.exceptions";
import { NotFoundError } from "../exceptions/common.exceptions";
import { GetRoundByIdFromDBError, GetRoundsByJobIdFromDBError } from "../exceptions/round.exceptions";
import { UpdateResumeScreeningInDBError } from "../exceptions/screening.exceptions";
import { updateApplicationRoundToDB, updateApplicationStatusInDB } from "../repository/application/application.repository";
import { updateApplicationTimelineToDB } from "../repository/applicationTimeline/applicationTimeline.repository";
import { updateResumeScreeningInDB } from "../repository/resumeScreening/resumeScreening.repository";
import { getRoundByIdFromDB, getRoundsByJobIdFromDB } from "../repository/rounds/rounds.repository";
import { IQualifyCandidateSchema } from "../routes/v1/round.router";
import { QualifyCandidateError } from "../exceptions/round.exceptions";


export async function qualifyCandidate(payload: IQualifyCandidateSchema) {
    try {
        // get round details of roundId
        const round = await getRoundByIdFromDB(payload.roundId);
        if (round.length === 0) {
            throw new NotFoundError('Round not found')
        }
        if (payload.screeningId) {
            // get next round details of the job
            const nextRound = await getRoundsByJobIdFromDB(round[0].jobId, round[0].roundNumber + 1);
            if (nextRound.length === 0) {
                // update application status to qualified or rejected
                return;
            }

            await Promise.all([
                // update application timeline
                updateApplicationTimelineToDB({
                    applicationId: payload.applicationId,
                    roundId: payload.roundId,
                    status: payload.isQualified ? 'qualified' : 'rejected',
                    title: "Resume Screening Completed",
                    description: "Your resume screening has been completed."
                }),
                // update in application table
                payload.isQualified && updateApplicationRoundToDB({
                    applicationId: payload.applicationId,
                    roundId: nextRound[0].roundId
                }),
                // update in resume screening table
                updateResumeScreeningInDB({
                    screeningId: payload.screeningId,
                    status: payload.isQualified ? 'qualified' : 'rejected'
                })
            ])
            if (!payload.isQualified) {
                // update application status to rejected
                await updateApplicationStatusInDB({
                    applicationId: payload.applicationId,
                    status: 'rejected'
                })
                // TODO: send email to candidate
            }

            // TODO(after interview table and routes): if next is interview round and is taken by ai then create interview for the candidate

        }
    } catch (error) {
        if (error instanceof GetRoundByIdFromDBError || error instanceof NotFoundError || error instanceof GetRoundsByJobIdFromDBError || error instanceof UpdateApplicationTimelineToDBError || error instanceof UpdateApplicationRoundToDBError || error instanceof UpdateApplicationStatusInDBError || error instanceof UpdateResumeScreeningInDBError) {
            throw error
        }
        throw new QualifyCandidateError('Failed to qualify candidate', { cause: (error as Error).cause });
    }
}
