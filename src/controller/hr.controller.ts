import { UserRoles } from "../constants/user.constants";
import { CreateUserInClerkServiceError } from "../exceptions/clerk.exceptions";
import { AssignReviewerToJobError, CreateReviewerError, GetJobsByHRError } from "../exceptions/hr.exceptions";
import { CreateReviewerInDBError } from "../exceptions/reviewer.exceptions";
import { GetJobByIdFromDBError, GetJobsByHRFromDBError, UpdateJobInDBError } from "../exceptions/job.exceptions";
import { GetUserByEmailFromDBError, UpdateUserInDBError } from "../exceptions/user.exceptions";
import { createReviewerInDB } from "../repository/reviewer/reviewer.repository";
import { getJobByIdFromDB, getJobsByHRFromDB, updateJobInDB } from "../repository/job/job.repository";
import { addUserInDB, getUserByEmailFromDB, updateUserInDB } from "../repository/users/users.repository";
import type { ICreateReviewerSchema, IAssignReviewerToJobSchema } from "../routes/v1/hr.route";
import { createUserInClerkService } from "../services/clerk.service";
import { NotFoundError } from "../exceptions/common.exceptions";

export async function getJobsByHR(hrId: string) {
	try {
		return await getJobsByHRFromDB(hrId);
	} catch (error) {
		if (error instanceof GetJobsByHRFromDBError) {
			throw error;
		}
		throw new GetJobsByHRError("Failed to get jobs by HR", { cause: (error as Error).message });
	}
}

export async function createReviewer(payload: ICreateReviewerSchema) {
	try {
		// check if user is present in user table by email
		const user = await getUserByEmailFromDB(payload.email);

		// if present then update user role column with reviewer, else add user in users table
		if (user.length > 0) {
			const roles = user[0].roles as string[];
			await Promise.all([
				updateUserInDB({
					userId: user[0].userId,
					roles: [...roles, UserRoles.REVIEWER],
				}),
				createReviewerInDB(payload),
			]);
		} else {
			// Create user in Clerk and add to DB
			const clerkUser = await createUserInClerkService(payload.email);
			await Promise.all([
				addUserInDB({
					email: payload.email,
					role: UserRoles.REVIEWER,
					userId: clerkUser.id,
				}),
				createReviewerInDB(payload),
			]);
			// TODO: Send email invitation to user with password
		}
	} catch (error) {
		if (error instanceof CreateReviewerInDBError || error instanceof UpdateUserInDBError || error instanceof GetUserByEmailFromDBError || error instanceof CreateUserInClerkServiceError) {
			throw error;
		}
		throw new CreateReviewerError("Failed to assign reviewer", { cause: (error as Error).message });
	}
}

export async function assignReviewerToJob(payload: IAssignReviewerToJobSchema) {
	try {
		const job = await getJobByIdFromDB(payload.jobId);
		if (job.length === 0) {
			throw new NotFoundError("Job not found");
		}
		const reviewers = (job[0].jobReviewers || []) as string[];
		if (reviewers.includes(payload.reviewerId)) {
			return;
		}
		await updateJobInDB({
			jobId: payload.jobId,
			jobReviewers: [...reviewers, payload.reviewerId],
		});
		return;
	} catch (error) {
		if (error instanceof NotFoundError || error instanceof GetJobByIdFromDBError || error instanceof UpdateJobInDBError) {
			throw error;
		}
		throw new AssignReviewerToJobError("Failed to assign reviewer to job", { cause: (error as Error).message });
	}
}
