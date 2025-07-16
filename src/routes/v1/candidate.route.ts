import { Hono } from "hono";
import z from "zod";
import { loginCandidate } from "../../controller/candidate.controller";
import { AddUserInDBError, GetUserByEmailFromDBError } from "../../exceptions/user.exceptions";
import { AddCandidateInDBError, GetCandidateByEmailFromDBError, LoginCandidateError } from "../../exceptions/candidate.exceptions";

const candidateRouter = new Hono();

const LoginSchema = z.object({
    userId: z.string(),
    email: z.email(),
    role: z.enum(['candidate', 'hr', 'company']),
})

export type ILoginSchema = z.infer<typeof LoginSchema>

candidateRouter.post('/login', async (c) => {
    try {
        const validation = LoginSchema.safeParse(await c.req.json())
        if (!validation.success) {
            throw validation.error;
        }
        const payload = validation.data
        const candidate = await loginCandidate(payload)
        return c.json({ success: true, message: 'Candidate logged in', candidate }, 200)
    } catch (error) {
        if (error instanceof z.ZodError) {
            const errMessage = JSON.parse(error.message)
            return c.json({ success: false, error: errMessage[0], message: errMessage[0].message }, 400)
        }
        if (error instanceof GetUserByEmailFromDBError || error instanceof AddUserInDBError || error instanceof GetCandidateByEmailFromDBError || error instanceof AddCandidateInDBError || error instanceof LoginCandidateError) {
            return c.json({ success: false, message: error.message, error: error.cause }, 400)
        }
        return c.json({ success: false, message: 'Something went wrong' }, 500)
    }
})

export default candidateRouter;
