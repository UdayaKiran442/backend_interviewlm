import { UserRoles } from "../constants/user.constants";
import { CreateUserInClerkServiceError } from "../exceptions/clerk.exceptions";
import { AssignInterviewerError, CreateInterviewerInDBError, GetJobsByHRError } from "../exceptions/hr.exceptions";
import { GetJobsByHRFromDBError } from "../exceptions/job.exceptions";
import { GetUserByEmailFromDBError, UpdateUserInDBError } from "../exceptions/user.exceptions";
import { createInterviewerInDB } from "../repository/hr/hr.repository";
import { getJobsByHRFromDB } from "../repository/job/job.repository";
import { addUserInDB, getUserByEmailFromDB, updateUserInDB } from "../repository/users/users.repository";
import type { IAssignInterviewerSchema } from "../routes/v1/hr.route";
import { createUserInClerkService } from "../services/clerk.service";

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

export async function inviteInterviewer(payload: IAssignInterviewerSchema) {
	try {
		// check if user is present in user table by email
		const user = await getUserByEmailFromDB(payload.email);

		// if present then update user role column with interviewer, else add user in users table
		if (user.length > 0) {
			const roles = user[0].roles as string[];
			await Promise.all([
				updateUserInDB({
					userId: user[0].userId,
					roles: [...roles, UserRoles.INTERVIEWER],
				}),
				createInterviewerInDB(payload),
			]);
		} else {
			// Create user in Clerk and add to DB
			const clerkUser = await createUserInClerkService(payload.email);
			await Promise.all([
				addUserInDB({
					email: payload.email,
					role: UserRoles.INTERVIEWER,
					userId: clerkUser.id,
				}),
				createInterviewerInDB(payload),
			]);
			// TODO: Send email invitation to user with password
		}
	} catch (error) {
		if (error instanceof CreateInterviewerInDBError || error instanceof UpdateUserInDBError || error instanceof GetUserByEmailFromDBError || error instanceof CreateUserInClerkServiceError) {
			throw error;
		}
		throw new AssignInterviewerError("Failed to assign interviewer", { cause: (error as Error).message });
	}
}
