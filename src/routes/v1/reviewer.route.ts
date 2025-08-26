import { Hono } from "hono";
import z from "zod";
import { searchReviewer } from "../../controller/reviewer.controller";
import { SearchReviewerError, SearchReviewerInDBError } from "../../exceptions/reviewer.exceptions";

const reviewerRoute = new Hono();

const SearchReviewerSchema = z.object({
	searchName: z.string().min(3).max(100),
});

export type ISearchReviewerSchema = z.infer<typeof SearchReviewerSchema>;

reviewerRoute.post("/search", async (c) => {
	try {
		const validation = SearchReviewerSchema.safeParse(await c.req.json());
		if (!validation.success) {
			throw validation.error;
		}
		const payload = {
			...validation.data,
		};
		const response = await searchReviewer(payload);
		return c.json({ success: true, response });
	} catch (error) {
		if (error instanceof z.ZodError) {
			const errMessage = JSON.parse(error.message);
			return c.json({ success: false, error: errMessage[0], message: errMessage[0].message }, 401);
		}
		if (error instanceof SearchReviewerError || error instanceof SearchReviewerInDBError) {
			return c.json({ success: false, error: error.message, message: error.message }, 400);
		}
		return c.json({ success: false, error: "Internal Server Error", message: "An unexpected error occurred" }, 500);
	}
});

export default reviewerRoute;
