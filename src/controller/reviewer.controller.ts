import { SearchReviewerError, SearchReviewerInDBError } from "../exceptions/reviewer.exceptions";
import { searchReviewerInDB } from "../repository/reviewer/reviewer.repository";
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
