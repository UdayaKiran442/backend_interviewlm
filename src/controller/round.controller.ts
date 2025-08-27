import { AddApplicationTimelineToDBError } from "../exceptions/applicationTimeline.exceptions";
import { NotFoundError } from "../exceptions/common.exceptions";
import { GetRoundByIdFromDBError, GetRoundsByJobIdFromDBError } from "../exceptions/round.exceptions";
import { UpdateResumeScreeningInDBError } from "../exceptions/screening.exceptions";
import { addApplicationTimelineToDB } from "../repository/applicationTimeline/applicationTimeline.repository";
import { updateResumeScreeningInDB } from "../repository/resumeScreening/resumeScreening.repository";
import { getRoundByIdFromDB, getRoundsByJobIdFromDB } from "../repository/rounds/rounds.repository";
import type { IQualifyCandidateSchema } from "../routes/v1/round.router";
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
import type { dbTx } from "../repository/db.types";
import { updateValidationInDB } from "../repository/validationsTable/validationsTable.repository";
import { ValidationTableStatus } from "../constants/validationTable.constants";
import { UpdateValidationInDBError } from "../exceptions/validationsTable.exceptions";

export async function qualifyCandidate(payload: IQualifyCandidateSchema) {
	try {
		const result = db.transaction(async (tx: dbTx) => {
			// get round details of roundId
			const [round, job] = await Promise.all([getRoundByIdFromDB(payload.roundId), getJobByIdFromDB(payload.jobId)]);
			const nextRound = await getRoundsByJobIdFromDB(round[0].jobId, round[0].roundNumber + 1);

			if (round.length === 0) {
				throw new NotFoundError("Round not found");
			}
			if (job.length === 0) {
				throw new NotFoundError("Job not found");
			}

			if (nextRound.length === 0 || !payload.isQualified) {
				// update application status to qualified or rejected
				await Promise.all([
					updateApplicationInDB({
						applicationId: payload.applicationId,
						status: payload.isQualified ? "qualified" : "rejected",
					}),
				]);
			}

			if (payload.screeningId) {
				await Promise.all([
					// add to application timeline
					addApplicationTimelineToDB(
						{
							applicationId: payload.applicationId,
							roundId: payload.roundId,
							status: payload.isQualified ? ApplicationTimelineStatus.QUALIFIED : ApplicationTimelineStatus.REJECTED,
							title: "Resume Screening Completed",
							description: "Your resume screening has been completed.",
						},
						tx,
					),
					// update in application table
					payload.isQualified &&
						nextRound[0] &&
						updateApplicationInDB(
							{
								applicationId: payload.applicationId,
								currentRound: nextRound[0].roundId,
							},
							tx,
						),
					// update in resume screening table
					updateResumeScreeningInDB(
						{
							screeningId: payload.screeningId,
							status: "completed",
						},
						tx,
					),
					// if qualified update inProgress count in job table
					payload.isQualified
						? nextRound[0]
							? updateJobInDB(
									{
										jobId: job[0].jobId,
										inProgress: job[0].inProgress + 1,
									},
									tx,
								)
							: updateJobInDB({
									jobId: job[0].jobId,
									inProgress: job[0].hired + 1,
								})
						: updateJobInDB(
								{
									jobId: job[0].jobId,
									rejected: job[0].rejected + 1,
								},
								tx,
							),
					updateRoundResultInDB(
						{
							roundId: payload.roundId,
							applicationId: payload.applicationId,
							verdictBy: payload.hrId,
							isQualified: payload.isQualified,
						},
						tx,
					),
				]);
			}
			if (payload.validationId) {
				// add to application timeline
				await Promise.all([
					addApplicationTimelineToDB({
						applicationId: payload.applicationId,
						roundId: payload.roundId,
						status: payload.isQualified ? ApplicationTimelineStatus.QUALIFIED : ApplicationTimelineStatus.REJECTED,
						title: "Validation Completed",
						description: "Your validation has been completed.",
					}),
					// update jobs table, if rejected increment rejected and decrement inProgress
					nextRound[0]
						? !payload.isQualified &&
							updateJobInDB({
								jobId: job[0].jobId,
								rejected: job[0].rejected + 1,
								inProgress: job[0].inProgress - 1,
							})
						: payload.isQualified
							? updateJobInDB({
									jobId: job[0].jobId,
									hired: job[0].hired + 1,
								})
							: updateJobInDB({
									jobId: job[0].jobId,
									rejected: job[0].rejected + 1,
								}),
					// update validations table with status completed
					updateValidationInDB({
						validationId: payload.validationId,
						status: ValidationTableStatus.COMPLETED,
						notes: payload.notes,
					}),
					// if nextRound present update application table with next round
					nextRound[0] &&
						payload.isQualified &&
						updateApplicationInDB({
							applicationId: payload.applicationId,
							currentRound: nextRound[0].roundId,
						}),
					// update round results table
					updateRoundResultInDB({
						roundId: payload.roundId,
						applicationId: payload.applicationId,
						verdictBy: payload.reviewerId,
						isQualified: payload.isQualified,
					}),
				]);
			}
			// if next is interview round and is taken by ai then create interview for the candidate
			if (payload.isQualified && nextRound[0].roundType === "Technical Interview" && nextRound[0].isAI) {
				await createAIInterview({
					applicationId: payload.applicationId,
					difficulty: nextRound[0].difficulty,
					questionType: nextRound[0].questionType,
					jobDescription: job[0].jobDescription,
					roundId: nextRound[0].roundId,
				});
			}
			return;
		});
		return result;
	} catch (error) {
		if (
			error instanceof GetRoundByIdFromDBError ||
			error instanceof NotFoundError ||
			error instanceof GetRoundsByJobIdFromDBError ||
			error instanceof UpdateResumeScreeningInDBError ||
			error instanceof UpdateApplicationInDBError ||
			error instanceof GetJobByIdFromDBError ||
			error instanceof UpdateJobInDBError ||
			error instanceof UpdateRoundResultInDBError ||
			error instanceof CreateInterviewInDBError ||
			error instanceof GetApplicationByIdFromDBError ||
			error instanceof GenerateQuestionsServiceError ||
			error instanceof InsertBulkQuestionsInDBError ||
			error instanceof AddApplicationTimelineToDBError ||
			error instanceof CreateAIInterviewError ||
			error instanceof UpdateValidationInDBError
		) {
			throw error;
		}
		throw new QualifyCandidateError("Failed to qualify candidate", { cause: (error as Error).message });
	}
}
