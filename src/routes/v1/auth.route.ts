import { Hono } from "hono";
import z from "zod";
import { loginUser } from "../../controller/auth.controller";
import { AddUserInDBError, GetUserByEmailFromDBError } from "../../exceptions/user.exceptions";
import { AddCandidateInDBError, GetCandidateByEmailFromDBError } from "../../exceptions/candidate.exceptions";
import { GetHRByEmailFromDBError } from "../../exceptions/hr.exceptions";
import { LoginUserError } from "../../exceptions/auth.exceptions";

const authRoute = new Hono();

const AuthSchema = z.object({
	userId: z.string(),
	email: z.email(),
});

export type IAuthSchema = z.infer<typeof AuthSchema> & {
	role: string;
};

authRoute.post("/login", async (c) => {
	try {
		const validation = AuthSchema.safeParse(await c.req.json());
		if (!validation.success) {
			throw validation.error;
		}
		const payload = {
			...validation.data,
			role: "" as "candidate" | "hr" | "interviewer",
		};
		const res = await loginUser(payload);
		return c.json({ success: true, message: "User logged in", res }, 200);
	} catch (error) {
		if (error instanceof z.ZodError) {
			const errMessage = JSON.parse(error.message);
			return c.json({ success: false, error: errMessage[0], message: errMessage[0].message }, 400);
		}
		if (
			error instanceof GetUserByEmailFromDBError ||
			error instanceof AddUserInDBError ||
			error instanceof GetCandidateByEmailFromDBError ||
			error instanceof AddCandidateInDBError ||
			error instanceof GetHRByEmailFromDBError ||
			error instanceof LoginUserError
		) {
			return c.json({ success: false, message: error.message, error: error.cause }, 400);
		}
		return c.json({ success: false, message: "Something went wrong" }, 500);
	}
});

export default authRoute;
