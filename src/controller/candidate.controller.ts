import { ILoginSchema, IOnboardingSchema } from "../routes/v1/candidate.route";

import { AddCandidateInDBError, GetCandidateByEmailFromDBError, GetCandidateByIDFromDBError, UpdateCandidateInDBError, LoginCandidateError, UpdateCandidateError } from "../exceptions/candidate.exceptions";
import { NotFoundError } from "../exceptions/common.exceptions";
import { AddUserInDBError, GetUserByEmailFromDBError } from "../exceptions/user.exceptions";

import { addCandidateInDB, getCandidateByEmailFromDB, getCandidateByIDFromDB, updateCandidateInDB } from "../repository/candidate/candidate.repository";
import { addUserInDB, getUserByEmailFromDB } from "../repository/users/users.repository";
import { parsePDF } from "../services/llamaindex.service";
import { ParsePDFError } from "../exceptions/llamaindex.exceptions";

export async function loginCandidate(payload: ILoginSchema) {
    try {
        // check if candidate exists in user table
        const user = await getUserByEmailFromDB(payload.email);
        if (user.length === 0) {
            // add candidate to users table and candidates table
            const [user, candidate] = await Promise.all([
                addUserInDB(payload),
                addCandidateInDB(payload),
            ])
            return candidate;
        }


        // check if candidate exists in candidates table
        const candidate = await getCandidateByEmailFromDB(payload.email);
        if (candidate.length === 0) {
            // add candidate to candidates table
            return await addCandidateInDB(payload);
        }
        return candidate;
    } catch (error) {
        if (error instanceof GetUserByEmailFromDBError || error instanceof AddUserInDBError || error instanceof GetCandidateByEmailFromDBError || error instanceof AddCandidateInDBError) {
            throw error;
        }
        throw new LoginCandidateError('Failed to login candidate', { cause: (error as Error).cause });
    }
}

export async function onboardingCandidate(payload: IOnboardingSchema) {
    try {
        // update the candidate table
        if (payload.resumeLink) {
            payload.resumeText = await parsePDF(payload.resumeLink);
        }
        const candidate = await getCandidateByIDFromDB(payload.candidateId);
        if (candidate.length === 0) {
            throw new NotFoundError('Candidate not found');
        }
        // TODO: upload resume to cloud storage and extract text from it.
        await updateCandidateInDB(payload);
    } catch (error) {
        if (error instanceof GetCandidateByIDFromDBError || error instanceof UpdateCandidateInDBError || error instanceof ParsePDFError) {
            throw error;
        }
        throw new UpdateCandidateError('Failed to update candidate', { cause: (error as Error).cause });
    }
}
