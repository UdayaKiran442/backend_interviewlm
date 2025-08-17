import { createInterviewInDB } from "../repository/interview/interview.repository";
import { CreateAIInterviewError, CreateInterviewInDBError } from "../exceptions/interview.exceptions";
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

export async function createAIInterview(payload: { applicationId: string; hrId: string; difficulty: string | null; questionType: string | null; jobDescription: string }) {
	try {
		const result = await db.transaction(async (tx: any) => {
			const [application] = await Promise.all([getApplicationByIdFromDB(payload.applicationId, tx)]);
			// create interview
			const interview = await createInterviewInDB(
				{
					applicationId: payload.applicationId,
					hrId: payload.hrId,
					difficulty: payload.difficulty,
					questionType: payload.questionType,
					roundId: application[0].currentRound,
					jobId: application[0].jobId,
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
