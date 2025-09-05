import z from "zod";
import { Hono } from "hono";

import { GetJobByIdFromDBError, GetJobsByHRFromDBError, UpdateJobInDBError } from "../../exceptions/job.exceptions";
import { createReviewer, getJobsByHR, assignReviewerToJob } from "../../controller/hr.controller";
import { CreateReviewerError, GetJobsByHRError } from "../../exceptions/hr.exceptions";
import { authMiddleware } from "../../middleware/auth.middleware";
import { GetUserByEmailFromDBError, UpdateUserInDBError } from "../../exceptions/user.exceptions";
import { CreateUserInClerkServiceError } from "../../exceptions/clerk.exceptions";
import { CreateReviewerInDBError, GetReviewerByEmailFromDBError } from "../../exceptions/reviewer.exceptions";
import { NotFoundError } from "../../exceptions/common.exceptions";

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

const CreateReviewerSchema = z.object({
	name: z.string().min(2).max(100),
	email: z.email(),
	phone: z.string().min(10).max(10),
	jobTitle: z.string(),
});

export type ICreateReviewerSchema = z.infer<typeof CreateReviewerSchema> & { hrId: string; companyId: string };

hrRoute.post("/create/reviewer", authMiddleware, async (c) => {
	try {
		const hrId = c.get("user").hrId;
		const companyId = c.get("user").companyId;
		const validation = CreateReviewerSchema.safeParse(await c.req.json());
		if (!validation.success) {
			throw validation.error;
		}
		const payload = {
			...validation.data,
			hrId,
			companyId,
		};
		await createReviewer(payload);
		return c.json({ success: true, message: "Reviewer invited successfully" }, 200);
	} catch (error) {
		if (error instanceof z.ZodError) {
			const errMessage = JSON.parse(error.message);
			return c.json({ success: false, message: "Invalid input", errors: errMessage.errors }, 400);
		}
		if (
			error instanceof CreateReviewerError ||
			error instanceof CreateReviewerInDBError ||
			error instanceof UpdateUserInDBError ||
			error instanceof GetUserByEmailFromDBError ||
			error instanceof CreateUserInClerkServiceError ||
			error instanceof GetReviewerByEmailFromDBError
		) {
			return c.json({ success: false, message: error.message, error: error.cause }, 400);
		}
		return c.json({ success: false, message: "Failed to assign reviewer", error: error }, 500);
	}
});

const AssignReviewerToJobSchema = z.object({
	jobId: z.string(),
	reviewerId: z.string(),
});

export type IAssignReviewerToJobSchema = z.infer<typeof AssignReviewerToJobSchema> & { hrId: string };

hrRoute.post("/assign/reviewer", async (c) => {
	try {
		const validation = AssignReviewerToJobSchema.safeParse(await c.req.json());
		if (!validation.success) {
			throw validation.error;
		}
		const payload = {
			...validation.data,
			hrId: "VofeF3rFUHbcjVZeTamp8",
		};
		await assignReviewerToJob(payload);
		return c.json({ success: true, message: "Reviewer assigned to job successfully" }, 200);
	} catch (error) {
		if (error instanceof z.ZodError) {
			const errMessage = JSON.parse(error.message);
			return c.json({ success: false, message: "Invalid input", errors: errMessage.errors }, 400);
		}
		if (error instanceof GetJobByIdFromDBError || error instanceof UpdateJobInDBError) {
			return c.json({ success: false, message: error.message, error: error.cause }, 400);
		}
		if (error instanceof NotFoundError) {
			return c.json({ success: false, message: error.message, error: error.cause }, 404);
		}
		return c.json({ success: false, message: "Failed to assign reviewer", error: error }, 500);
	}
});

export default hrRoute;
