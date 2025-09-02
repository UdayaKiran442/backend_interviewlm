import { eq, sql } from "drizzle-orm";

import { CreateReviewerInDBError, GetReviewerByEmailFromDBError, GetReviewersByCompanyIdFromDBError, SearchReviewerInDBError } from "../../exceptions/reviewer.exceptions";
import type { ICreateReviewerSchema } from "../../routes/v1/hr.route";
import { generateNanoId } from "../../utils/nanoid.utils";
import db from "../db";
import { jobs, reviewer, validationTable } from "../schema";
import type { ISearchReviewerSchema } from "../../routes/v1/reviewer.route";

export async function createReviewerInDB(payload: ICreateReviewerSchema) {
	try {
		const insertPayload = {
			reviewerId: `reviewer-${generateNanoId()}`,
			companyId: payload.companyId,
			name: payload.name,
			email: payload.email,
			phone: payload.phone,
			jobTitle: payload.jobTitle,
			createdAt: new Date(),
			updatedAt: new Date(),
		};
		await db.insert(reviewer).values(insertPayload);
		return insertPayload;
	} catch (error) {
		throw new CreateReviewerInDBError("Failed to create reviewer in DB", { cause: (error as Error).message });
	}
}

export async function getReviewerByEmailFromDB(email: string) {
	try {
		return await db.select().from(reviewer).where(eq(reviewer.email, email));
	} catch (error) {
		throw new GetReviewerByEmailFromDBError("Failed to get reviewer by email from DB", { cause: (error as Error).message });
	}
}

export async function searchReviewerInDB(payload: ISearchReviewerSchema) {
	try {
		return await db
			.select()
			.from(reviewer)
			.where(sql`lower(${reviewer.name}) LIKE ${`%${payload.searchName.toLowerCase()}%`}`);
	} catch (error) {
		throw new SearchReviewerInDBError("Failed to search reviewer in DB", { cause: (error as Error).message });
	}
}

export async function getReviewersByCompanyIdFromDB(companyId: string) {
	try {
		return await db
			.select({
				reviewerId: reviewer.reviewerId,
				name: reviewer.name,
				email: reviewer.email,
				phone: reviewer.phone,
				reviewerJobTitle: reviewer.jobTitle,
				createdAt: reviewer.createdAt,
				updatedAt: reviewer.updatedAt,
				jobId: jobs.jobId,
				jobTitle: jobs.jobTitle,
			})
			.from(reviewer)
			.where(eq(reviewer.companyId, companyId))
			.leftJoin(validationTable, eq(reviewer.reviewerId, validationTable.reviewerId))
			.leftJoin(jobs, eq(validationTable.jobId, jobs.jobId));
	} catch (error) {
		throw new GetReviewersByCompanyIdFromDBError("Failed to get reviewers by company ID from DB", { cause: (error as Error).message });
	}
}
