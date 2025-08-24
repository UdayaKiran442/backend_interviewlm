import { AddCandidateInDBError, GetCandidateByEmailFromDBError } from "../exceptions/candidate.exceptions";
import { GetHRByEmailFromDBError } from "../exceptions/hr.exceptions";
import { AddUserInDBError, GetUserByEmailFromDBError } from "../exceptions/user.exceptions";
import { addCandidateInDB, getCandidateByEmailFromDB } from "../repository/candidate/candidate.repository";
import { getHRByEmailFromDB } from "../repository/hr/hr.repository";
import { addUserInDB, getUserByEmailFromDB } from "../repository/users/users.repository";
import type { IAuthSchema } from "../routes/v1/auth.route";
import { LoginUserError } from "../exceptions/auth.exceptions";
import { UserRoles } from "../constants/user.constants";
import { GetReviewerByEmailFromDBError } from "../exceptions/reviewer.exceptions";
import { getReviewerByEmailFromDB } from "../repository/reviewer/reviewer.repository";

export async function loginUser(payload: IAuthSchema) {
	try {
		// check if user exists in user table
		const user = await getUserByEmailFromDB(payload.email);
		if (user.length === 0) {
			// only "candidate" role can register
			// add user and candidate
			payload.role = UserRoles.CANDIDATE;
			const [user, candidate] = await Promise.all([addUserInDB(payload), addCandidateInDB(payload)]);
			return { user, candidate, role: UserRoles.CANDIDATE };
		}

		// check the role of the user
		const roles = user[0].roles as string[];
		// check table based on role
		// return user along with role
		if (roles.includes(UserRoles.CANDIDATE)) {
			const candidate = await getCandidateByEmailFromDB(payload.email);
			return {
				userId: user[0].userId,
				email: user[0].email,
				candidate: candidate[0],
				role: UserRoles.CANDIDATE,
			};
		}
		if (roles.includes(UserRoles.HR)) {
			const hr = await getHRByEmailFromDB(payload.email);
			return {
				userId: user[0].userId,
				hrId: hr[0].hrId,
				companyId: hr[0].companyId,
				phone: hr[0].phone,
				name: hr[0].name,
				email: user[0].email,
				isOrgAdmin: hr[0].isOrgAdmin,
				role: UserRoles.HR,
			};
		}
		if (roles.includes(UserRoles.REVIEWER)) {
			const reviewer = await getReviewerByEmailFromDB(payload.email);
			return {
				userId: user[0].userId,
				reviewerId: reviewer[0].reviewerId,
				companyId: reviewer[0].companyId,
				phone: reviewer[0].phone,
				name: reviewer[0].name,
				email: user[0].email,
				role: UserRoles.REVIEWER,
			};
		}
	} catch (error) {
		if (
			error instanceof GetUserByEmailFromDBError ||
			error instanceof AddUserInDBError ||
			error instanceof GetCandidateByEmailFromDBError ||
			error instanceof AddCandidateInDBError ||
			error instanceof GetHRByEmailFromDBError ||
			error instanceof GetReviewerByEmailFromDBError
		) {
			throw error;
		}
		throw new LoginUserError("Failed to login user", { cause: (error as Error).message });
	}
}
