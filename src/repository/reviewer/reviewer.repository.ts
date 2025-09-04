import { eq, sql } from "drizzle-orm";

import { CreateReviewerInDBError, GetReviewerByEmailFromDBError, GetReviewersByCompanyIdFromDBError, SearchReviewerInDBError } from "../../exceptions/reviewer.exceptions";
import type { ICreateReviewerSchema } from "../../routes/v1/hr.route";
import { generateNanoId } from "../../utils/nanoid.utils";
import db from "../db";
import { reviewer } from "../schema";
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
		const reviewers = await db.execute(sql`
			SELECT 
			r."reviewerId",
   	 		r."name",
    		r."email",
    		r."phone",
    		r."jobTitle" as "reviewerJobTitle",
    		json_agg(
				json_build_object(
        			'jobId', j."jobId",
        			'jobTitle', j."jobTitle"
      			)
    		) as jobs
  FROM reviewer r
  JOIN validations_table v ON v."reviewerId" = r."reviewerId"
  JOIN jobs j ON j."jobId" = v."jobId"
  WHERE r."companyId" = ${companyId}
  GROUP BY r."reviewerId", r."name", r."email", r."phone", r."jobTitle"
`);
		return reviewers.rows;
	} catch (error) {
		throw new GetReviewersByCompanyIdFromDBError("Failed to get reviewers by company ID from DB", { cause: (error as Error).message });
	}
}
