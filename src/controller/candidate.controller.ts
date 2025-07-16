import { AddCandidateInDBError, GetCandidateByEmailFromDBError } from "../exceptions/candidate.exceptions";
import { AddUserInDBError, GetUserByEmailFromDBError } from "../exceptions/user.exceptions";
import { addCandidateInDB, getCandidateByEmailFromDB } from "../repository/candidate/candidate.repository";
import { addUserInDB, getUserByEmailFromDB } from "../repository/users/users.repository";
import { ILoginSchema } from "../routes/v1/candidate.route";
import { LoginCandidateError } from "../exceptions/candidate.exceptions";

export async function loginCandidate(payload: ILoginSchema) {
    try {
        // check if candidate exists in user table
        const user = await getUserByEmailFromDB(payload.email);
        if(user.length === 0){
            // add candidate to users table and candidates table
            const [user, candidate] = await Promise.all([
                addUserInDB(payload),
                addCandidateInDB(payload),
            ])
            return candidate;
        }


        // check if candidate exists in candidates table
        const candidate = await getCandidateByEmailFromDB(payload.email);
        if(candidate.length === 0){
            // add candidate to candidates table
            return await addCandidateInDB(payload);
        }
        return candidate;
    } catch (error) {
        if(error instanceof GetUserByEmailFromDBError || error instanceof AddUserInDBError || error instanceof GetCandidateByEmailFromDBError || error instanceof AddCandidateInDBError) {
            throw error;
        }
        throw new LoginCandidateError('Failed to login candidate', { cause: (error as Error).cause });
    }
}
