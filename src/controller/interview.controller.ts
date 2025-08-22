import { createInterviewInDB, getInterviewByIdFromDB, updateInterviewInDB } from "../repository/interview/interview.repository";
import {
	CreateAIInterviewError,
	CreateInterviewInDBError,
	GetInterviewByIdFromDBError,
	StartAIInterviewError,
	SubmitInterviewError,
	UpdateInterviewInDBError,
} from "../exceptions/interview.exceptions";
import db from "../repository/db";
import { generateInterviewFeedbackService, generateQuestionsService } from "../services/openai.service";
import { getApplicationByIdFromDB } from "../repository/application/application.repository";
import { GetApplicationByIdFromDBError } from "../exceptions/applications.exceptions";
import { getQuestionsByInterviewIdFromDB, insertBulkQuestionsInDB } from "../repository/question/question.repository";
import { GenerateInterviewFeedbackServiceError, GenerateQuestionsServiceError } from "../exceptions/openai.exceptions";
import { addApplicationTimelineToDB } from "../repository/applicationTimeline/applicationTimeline.repository";
import { GetQuestionsByInterviewIdFromDBError, InsertBulkQuestionsInDBError } from "../exceptions/question.exceptions";
import { AddApplicationTimelineToDBError } from "../exceptions/applicationTimeline.exceptions";
import { ApplicationTimelineStatus } from "../constants/applicationTimeline.constants";
import type { dbTx } from "../repository/db.types";
import type { IStartAIInterviewSchema, ISubmitInterviewSchema } from "../routes/v1/interview.route";
import { InterviewStatus } from "../constants/interview.constants";
import { getJobByIdFromDB, updateJobInDB } from "../repository/job/job.repository";
import { GetJobByIdFromDBError, UpdateJobInDBError } from "../exceptions/job.exceptions";
import { NotFoundError } from "../exceptions/common.exceptions";
import type { IGenerateInterviewFeedbackService } from "../types/prompt.types";
import { insertRoundResultsToDB } from "../repository/roundResults/roundResults.repository";

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
				isDisplayed: false,
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

export async function submitInterview(payload: ISubmitInterviewSchema) {
	try {
		const [questions, interview] = await Promise.all([getQuestionsByInterviewIdFromDB(payload.interviewId), getInterviewByIdFromDB(payload.interviewId)]);
		if (questions.length === 0) {
			throw new NotFoundError("No questions found for the interview");
		}
		const llmPayload: IGenerateInterviewFeedbackService = questions.map((question) => {
			return {
				questionText: question.question,
				feedback: question.feedback ?? "",
			};
		});
		// generate feedback based on feedback given to questions.
		const feedback = await generateInterviewFeedbackService(llmPayload);

		// store feedback in round results table
		// add to application timeline, update status in interview table and add to validations table.

		await Promise.all([
			insertRoundResultsToDB({
				applicationId: interview[0].applicationId,
				roundId: interview[0].roundId,
				feedback: feedback.response,
			}),
			addApplicationTimelineToDB({
				applicationId: interview[0].applicationId,
				roundId: interview[0].roundId,
				title: "Interview Submitted - Verdict Pending",
				status: ApplicationTimelineStatus.VERDICT_PENDING,
				description: "Interview submitted successfully and ",
			}),
			updateInterviewInDB({
				interviewId: payload.interviewId,
				status: InterviewStatus.VERDICT_PENDING,
			}),
			// TODO: Add to validations table
		]);
	} catch (error) {
		if (error instanceof GetQuestionsByInterviewIdFromDBError || error instanceof NotFoundError || error instanceof GenerateInterviewFeedbackServiceError) {
			throw error;
		}
		throw new SubmitInterviewError("Failed to submit interview", { cause: (error as Error).message });
	}
}
