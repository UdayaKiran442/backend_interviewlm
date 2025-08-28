import { Hono } from "hono";
import z from "zod";
import { qualifyCandidate } from "../../controller/round.controller";
import { GetRoundByIdFromDBError, GetRoundsByJobIdFromDBError } from "../../exceptions/round.exceptions";
import { AddApplicationTimelineToDBError, UpdateApplicationTimelineToDBError } from "../../exceptions/applicationTimeline.exceptions";
import { UpdateResumeScreeningInDBError } from "../../exceptions/screening.exceptions";
import { NotFoundError } from "../../exceptions/common.exceptions";
import { GetApplicationByIdFromDBError, UpdateApplicationInDBError } from "../../exceptions/applications.exceptions";
import { GetJobByIdFromDBError, UpdateJobInDBError } from "../../exceptions/job.exceptions";
import { InsertBulkQuestionsInDBError } from "../../exceptions/question.exceptions";
import { GenerateQuestionsServiceError } from "../../exceptions/openai.exceptions";
import { CreateAIInterviewError, CreateInterviewInDBError } from "../../exceptions/interview.exceptions";

const roundRouter = new Hono();

const QualifyCandidateSchema = z.object({
	applicationId: z.string(),
	roundId: z.string(),
	jobId: z.string(),
	screeningId: z.string().optional(),
	validationId: z.string().optional(),
	notes: z.string().optional(),
	isQualified: z.boolean(),
});

export type IQualifyCandidateSchema = z.infer<typeof QualifyCandidateSchema> & {
	hrId: string;
	reviewerId: string;
};

roundRouter.post("/qualify/candidate", async (c) => {
	try {
		// const userRole = c.get("user").role;
		const validation = QualifyCandidateSchema.safeParse(await c.req.json());
		if (!validation.success) {
			throw validation.error;
		}
		// if (userRole === UserRoles.HR) {
		// 	// TODO: Implement HR specific payload
		// }
		// if (userRole === UserRoles.REVIEWER) {
		// 	// TODO: Implement reviewer specific payload
		// }

		const payload = {
			...validation.data,
			hrId: "VofeF3rFUHbcjVZeTamp8",
			reviewerId: "reviewer-UtO-IdOjltDKD3T4XLVl8",
		};
		await qualifyCandidate(payload);
		return c.json({ success: true, message: "Candidate qualified/rejected" }, 200);
	} catch (error) {
		if (error instanceof z.ZodError) {
			const errMessage = JSON.parse(error.message);
			return c.json({ success: false, error: errMessage[0], message: errMessage[0].message }, 400);
		}
		if (error instanceof NotFoundError) {
			return c.json({ success: false, message: error.message, error: error.cause }, 404);
		}
		if (
			error instanceof GetRoundByIdFromDBError ||
			error instanceof GetRoundsByJobIdFromDBError ||
			error instanceof UpdateApplicationTimelineToDBError ||
			error instanceof UpdateResumeScreeningInDBError ||
			error instanceof UpdateApplicationInDBError ||
			error instanceof GetJobByIdFromDBError ||
			error instanceof UpdateJobInDBError ||
			error instanceof CreateInterviewInDBError ||
			error instanceof GetApplicationByIdFromDBError ||
			error instanceof GenerateQuestionsServiceError ||
			error instanceof InsertBulkQuestionsInDBError ||
			error instanceof AddApplicationTimelineToDBError ||
			error instanceof CreateAIInterviewError
		) {
			return c.json({ success: false, message: error.message, error: error.cause }, 400);
		}
		return c.json({ success: false, message: "Something went wrong" }, 500);
	}
});

export default roundRouter;
