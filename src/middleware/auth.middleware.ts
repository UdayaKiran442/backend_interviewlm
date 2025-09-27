import type { Context } from "hono";
import { jwtDecode } from "jwt-decode";
import { UnauthorizedError } from "../exceptions/common.exceptions";
import { getHRByUserIdFromDB } from "../repository/hr/hr.repository";
import { UserRoles } from "../constants/user.constants";

export interface AuthUser {
	userId: string;
	hrId: string;
	role: string;
	companyId: string;
}

declare module "hono" {
	interface ContextVariableMap {
		user: AuthUser;
	}
}

export const authMiddleware = async (c: Context, next: () => Promise<void>) => {
	try {
		// Get the token from the Authorization header
		const authHeader = c.req.header("Authorization");
		const userRole = c.req.header("X-User-Role");
		if (!authHeader) {
			throw new UnauthorizedError("Login to access this resource");
		}

		const token = authHeader;
		if (!token) {
			throw new UnauthorizedError("Login to access this resource");
		}

		const decodedToken = jwtDecode(token);

		// Get user from database
		if (decodedToken.sub) {
			if (userRole === UserRoles.HR) {
				const hr = await getHRByUserIdFromDB(decodedToken.sub);
				c.set("user", { userId: hr[0].userId, hrId: hr[0].hrId, role: userRole, companyId: hr[0].companyId });
			}
			if (userRole === UserRoles.REVIEWER) {
				// TODO: Implement reviewer authentication
			}
			if (userRole === UserRoles.CANDIDATE) {
				// TODO: Implement candidate authentication
			}
		}
		await next();
	} catch (error) {
		if (error instanceof UnauthorizedError) {
			return c.json({ success: false, message: error.message }, 401);
		}
		return c.json({ success: false, message: "Invalid or expired token" }, 401);
	}
};
