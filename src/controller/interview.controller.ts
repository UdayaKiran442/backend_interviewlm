import { createInterviewInDB, getInterviewByIdFromDB, updateInterviewInDB } from "../repository/interview/interview.repository";
import { CreateAIInterviewError, CreateInterviewInDBError, GetInterviewByIdFromDBError, StartAIInterviewError, UpdateInterviewInDBError } from "../exceptions/interview.exceptions";
import db from "../repository/db";
import { generateQuestionsService } from "../services/openai.service";
import { getApplicationByIdFromDB } from "../repository/application/application.repository";
import { GetApplicationByIdFromDBError } from "../exceptions/applications.exceptions";
import { insertBulkQuestionsInDB } from "../repository/question/question.repository";
import { GenerateQuestionsServiceError } from "../exceptions/openai.exceptions";
import { addApplicationTimelineToDB } from "../repository/applicationTimeline/applicationTimeline.repository";
import { InsertBulkQuestionsInDBError } from "../exceptions/question.exceptions";
import { AddApplicationTimelineToDBError } from "../exceptions/applicationTimeline.exceptions";
import { ApplicationTimelineStatus } from "../constants/applicationTimeline.constants";
import type { dbTx } from "../repository/db.types";
import type { IStartAIInterviewSchema } from "../routes/v1/interview.route";
import { InterviewStatus } from "../constants/interview.constants";
import { getJobByIdFromDB, updateJobInDB } from "../repository/job/job.repository";
import { GetJobByIdFromDBError, UpdateJobInDBError } from "../exceptions/job.exceptions";

export async function createAIInterview(payload: { applicationId: string; difficulty: string | null; questionType: string | null; jobDescription: string }) {
	try {
		const result = await db.transaction(async (tx: dbTx) => {
			const [application] = await Promise.all([getApplicationByIdFromDB(payload.applicationId, tx)]);
			// create interview
			const interview = await createInterviewInDB(
				{
					applicationId: payload.applicationId,
					difficulty: payload.difficulty,
					questionType: payload.questionType,
					roundId: application[0].currentRound,
					roundResultsId: null,
					status: InterviewStatus.PENDING,
					jobDescription: payload.jobDescription,
					resumeText: application[0].resumeText,
				},
				tx,
			);
			// generate questions
			const questions = await generateQuestionsService({
				resumeText: application[0].resumeText,
				difficulty: payload.difficulty ?? "",
				jobDescription: payload.jobDescription,
				questionType: payload.questionType ?? "",
			});

			// insert questions in db
			const newQuestions = await insertBulkQuestionsInDB({
				interviewId: interview.interviewId,
				questions: questions.response,
			});

			// update application timeline
			await addApplicationTimelineToDB(
				{
					applicationId: payload.applicationId,
					roundId: application[0].currentRound,
					title: "Interview Created",
					status: ApplicationTimelineStatus.PENDING,
					description: "Interview created successfully",
				},
				tx,
			);
			return {
				interview,
				questions: newQuestions,
			};
		});
		return result;
	} catch (error) {
		if (
			error instanceof CreateInterviewInDBError ||
			error instanceof GetApplicationByIdFromDBError ||
			error instanceof GenerateQuestionsServiceError ||
			error instanceof InsertBulkQuestionsInDBError ||
			error instanceof AddApplicationTimelineToDBError
		) {
			throw error;
		}
		throw new CreateAIInterviewError("Failed to create AI interview", { cause: (error as Error).message });
	}
}

export async function startAIInterview(payload: IStartAIInterviewSchema) {
	try {
		const [jobs, interview] = await Promise.all([getJobByIdFromDB(payload.jobId), getInterviewByIdFromDB(payload.interviewId)]);
		// TODO:future add candidate id column in interview table and check if the logged in candidate is for whom interview is created
		await Promise.all([
			updateInterviewInDB({
				interviewId: payload.interviewId,
				status: InterviewStatus.IN_PROGRESS,
			}),
			updateJobInDB({
				jobId: payload.jobId,
				interviewing: jobs[0].interviewing + 1,
			}),
			addApplicationTimelineToDB({
				applicationId: interview[0].applicationId,
				roundId: interview[0].roundId,
				title: "Interview Started",
				status: ApplicationTimelineStatus.IN_PROGRESS,
				description: "Interview started successfully",
			}),
		]);
	} catch (error) {
		if (
			error instanceof GetJobByIdFromDBError ||
			error instanceof GetInterviewByIdFromDBError ||
			error instanceof UpdateInterviewInDBError ||
			error instanceof UpdateJobInDBError ||
			error instanceof AddApplicationTimelineToDBError
		) {
			throw error;
		}
		throw new StartAIInterviewError("Failed to start AI interview", { cause: (error as Error).message });
	}
}
