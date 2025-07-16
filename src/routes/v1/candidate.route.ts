import { Hono } from "hono";
import z from "zod";
import { loginCandidate } from "../../controller/candidate.controller";

const candidateRouter = new Hono();

const LoginSchema = z.object({
    userId: z.string(),
    email: z.email(),
    role: z.enum(['candidate', 'hr', 'company']),
})

export type ILoginSchema = z.infer<typeof LoginSchema>

candidateRouter.post('/login', async (c) => {
    try {
        const payload = await c.req.json()
        const candidate = await loginCandidate(payload)
        return c.json({ success: true, message: 'Candidate logged in', candidate }, 200)
    } catch (error) {
        
    }
})

export default candidateRouter;
