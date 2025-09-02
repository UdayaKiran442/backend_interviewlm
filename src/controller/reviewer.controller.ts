import { GetReviewersByCompanyIdError, GetReviewersByCompanyIdFromDBError, SearchReviewerError, SearchReviewerInDBError } from "../exceptions/reviewer.exceptions";
import { getReviewersByCompanyIdFromDB, searchReviewerInDB } from "../repository/reviewer/reviewer.repository";
import type { ISearchReviewerSchema } from "../routes/v1/reviewer.route";

export async function searchReviewer(payload: ISearchReviewerSchema) {
	try {
		return await searchReviewerInDB(payload);
	} catch (error) {
		if (error instanceof SearchReviewerInDBError) {
			throw error;
		}
		throw new SearchReviewerError("Failed to search reviewer", { cause: (error as Error).message });
	}
}

export async function getReviewersByCompanyId(companyId: string) {
	try {
		return await getReviewersByCompanyIdFromDB(companyId);
	} catch (error) {
		if (error instanceof GetReviewersByCompanyIdFromDBError) {
			throw error;
		}
		throw new GetReviewersByCompanyIdError("Failed to get reviewers by company ID", { cause: (error as Error).message });
	}
}
