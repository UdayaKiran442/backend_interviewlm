import { Hono } from "hono";
import z from "zod";
import { qualifyCandidate } from "../../controller/round.controller";

const roundRouter = new Hono();

const QualifyCandidateSchema = z.object({
    applicationId: z.string(),
    roundId: z.string(),
    jobId: z.string(),
    screeningId: z.string().optional(),
    isQualified: z.boolean(),
})

export type IQualifyCandidateSchema = z.infer<typeof QualifyCandidateSchema>

roundRouter.post('/qualify/candidate', async (c) => {
    try {
        const validation = QualifyCandidateSchema.safeParse(await c.req.json())
        if (!validation.success) {
            throw validation.error
        }
        const payload = {
            ...validation.data,
            hrId: "VofeF3rFUHbcjVZeTamp8"
        }
        await qualifyCandidate(payload)
        return c.json({ success: true, message: 'Candidate qualified/rejected' }, 200)
    } catch (error) {
        
    }
})

export default roundRouter;