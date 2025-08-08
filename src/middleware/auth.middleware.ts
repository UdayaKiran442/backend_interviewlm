import { Context } from 'hono';
import { jwtDecode } from "jwt-decode";
import { UnauthorizedError } from '../exceptions/common.exceptions';
import { getHRByUserIdFromDB } from '../repository/hr/hr.repository';

export interface AuthUser {
    userId: string;
    hrId: string;
}

declare module 'hono' {
    interface ContextVariableMap {
        user: AuthUser;
    }
}

export const authMiddleware = async (c: Context, next: () => Promise<void>) => {
    try {
        // Get the token from the Authorization header
        const authHeader = c.req.header('Authorization');
        const userRole = c.req.header('X-User-Role')
        if (!authHeader) {
            throw new UnauthorizedError('No token provided');
        }

        const token = authHeader;
        if (!token) {
            throw new UnauthorizedError('No token provided');
        }

        const decodedToken = jwtDecode(token);

        // Get user from database
        if (decodedToken.sub) {
            if (userRole === 'hr') {
                const hr = await getHRByUserIdFromDB(decodedToken.sub)
                c.set("user", { userId: hr[0].userId, hrId: hr[0].hrId })
            }
        }
        await next()
    } catch (error) {
        if (error instanceof UnauthorizedError) {
            return c.json({ success: false, message: error.message }, 401);
        }
        return c.json({ success: false, message: 'Invalid or expired token' }, 401);
    }
};
