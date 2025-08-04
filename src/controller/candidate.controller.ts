import { IOnboardingSchema } from "../routes/v1/candidate.route";

import { GetCandidateByIDFromDBError, OnBoardCandidateInDBError, OnboardCandidateError } from "../exceptions/candidate.exceptions";
import { NotFoundError } from "../exceptions/common.exceptions";

import { getCandidateByIDFromDB, onBoardCandidateInDB } from "../repository/candidate/candidate.repository";
import { parsePDF } from "../services/llamaindex.service";
import { ParsePDFError } from "../exceptions/llamaindex.exceptions";

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
        await onBoardCandidateInDB(payload);
    } catch (error) {
        if (error instanceof GetCandidateByIDFromDBError || error instanceof OnBoardCandidateInDBError || error instanceof ParsePDFError) {
            throw error;
        }
        throw new OnboardCandidateError('Failed to update candidate', { cause: (error as Error).cause });
    }
}
