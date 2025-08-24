import z from "zod";
import { Hono } from "hono";

import { GetJobsByHRFromDBError } from "../../exceptions/job.exceptions";
import { inviteReviewer, getJobsByHR } from "../../controller/hr.controller";
import { InviteReviewerError, GetJobsByHRError } from "../../exceptions/hr.exceptions";
import { authMiddleware } from "../../middleware/auth.middleware";
import { GetUserByEmailFromDBError, UpdateUserInDBError } from "../../exceptions/user.exceptions";
import { CreateUserInClerkServiceError } from "../../exceptions/clerk.exceptions";
import { CreateReviewerInDBError } from "../../exceptions/reviewer.exceptions";

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

const AssignReviewerSchema = z.object({
	companyId: z.string(),
	name: z.string().min(2).max(100),
	email: z.email(),
	phone: z.string().min(10).max(10).optional(),
	jobTitle: z.string(),
});

export type IAssignReviewerSchema = z.infer<typeof AssignReviewerSchema> & { hrId: string };

hrRoute.post("/invite/reviewer", async (c) => {
	try {
		const validation = AssignReviewerSchema.safeParse(await c.req.json());
		if (!validation.success) {
			throw validation.error;
		}
		const payload = {
			...validation.data,
			hrId: "VofeF3rFUHbcjVZeTamp8",
		};
		const response = await inviteReviewer(payload);
		return c.json({ success: true, message: "Reviewer invited successfully", response }, 200);
	} catch (error) {
		if (error instanceof z.ZodError) {
			const errMessage = JSON.parse(error.message);
			return c.json({ success: false, message: "Invalid input", errors: errMessage.errors }, 400);
		}
		if (
			error instanceof InviteReviewerError ||
			error instanceof CreateReviewerInDBError ||
			error instanceof UpdateUserInDBError ||
			error instanceof GetUserByEmailFromDBError ||
			error instanceof CreateUserInClerkServiceError
		) {
			return c.json({ success: false, message: error.message, error: error.cause }, 400);
		}
		return c.json({ success: false, message: "Failed to assign reviewer", error: error }, 500);
	}
});

export default hrRoute;
