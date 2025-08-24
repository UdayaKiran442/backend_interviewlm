import z from "zod";
import { Hono } from "hono";

import { GetJobsByHRFromDBError } from "../../exceptions/job.exceptions";
import { inviteInterviewer, getJobsByHR } from "../../controller/hr.controller";
import { InviteInterviewerError, GetJobsByHRError } from "../../exceptions/hr.exceptions";
import { authMiddleware } from "../../middleware/auth.middleware";
import { GetUserByEmailFromDBError, UpdateUserInDBError } from "../../exceptions/user.exceptions";
import { CreateUserInClerkServiceError } from "../../exceptions/clerk.exceptions";
import { CreateInterviewerInDBError } from "../../exceptions/interviewer.exceptions";

const hrRoute = new Hono();

hrRoute.get("/jobs", authMiddleware, async (c) => {
	try {
		const hrId = c.get("user").hrId;
		const jobs = await getJobsByHR(hrId);
		return c.json({ success: true, message: "Jobs fetched successfully", jobs }, 200);
	} catch (error) {
		if (error instanceof GetJobsByHRFromDBError || error instanceof GetJobsByHRError) {
			return c.json({ success: false, message: error.message, error: error.cause }, 400);
		}
		return c.json({ success: false, message: "Failed to fetch jobs", error: error }, 500);
	}
});

const AssignInterviewerSchema = z.object({
	companyId: z.string(),
	name: z.string().min(2).max(100),
	email: z.email(),
	phone: z.string().min(10).max(10).optional(),
	jobTitle: z.string(),
});

export type IAssignInterviewerSchema = z.infer<typeof AssignInterviewerSchema> & { hrId: string };

hrRoute.post("/invite/interviewer", async (c) => {
	try {
		const validation = AssignInterviewerSchema.safeParse(await c.req.json());
		if (!validation.success) {
			throw validation.error;
		}
		const payload = {
			...validation.data,
			hrId: "VofeF3rFUHbcjVZeTamp8",
		};
		const response = await inviteInterviewer(payload);
		return c.json({ success: true, message: "Interviewer invited successfully", response }, 200);
	} catch (error) {
		if (error instanceof z.ZodError) {
			const errMessage = JSON.parse(error.message);
			return c.json({ success: false, message: "Invalid input", errors: errMessage.errors }, 400);
		}
		if (
			error instanceof InviteInterviewerError ||
			error instanceof CreateInterviewerInDBError ||
			error instanceof UpdateUserInDBError ||
			error instanceof GetUserByEmailFromDBError ||
			error instanceof CreateUserInClerkServiceError
		) {
			return c.json({ success: false, message: error.message, error: error.cause }, 400);
		}
		return c.json({ success: false, message: "Failed to assign interviewer", error: error }, 500);
	}
});

export default hrRoute;
