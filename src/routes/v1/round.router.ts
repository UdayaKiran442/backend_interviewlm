import { Hono } from "hono";
import z from "zod";
import { qualifyCandidate } from "../../controller/round.controller";
import { GetRoundByIdFromDBError, GetRoundsByJobIdFromDBError } from "../../exceptions/round.exceptions";
import { UpdateApplicationTimelineToDBError } from "../../exceptions/applicationTimeline.exceptions";
import { UpdateResumeScreeningInDBError } from "../../exceptions/screening.exceptions";
import { NotFoundError } from "../../exceptions/common.exceptions";
import { UpdateApplicationInDBError } from "../../exceptions/applications.exceptions";

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
        if (error instanceof z.ZodError) {
            const errMessage = JSON.parse(error.message)
            return c.json({ success: false, error: errMessage[0], message: errMessage[0].message }, 400)
        }
        if (error instanceof NotFoundError) {
            return c.json({ success: false, message: error.message, error: error.cause }, 404)
        }
        if (error instanceof GetRoundByIdFromDBError || error instanceof GetRoundsByJobIdFromDBError || error instanceof UpdateApplicationTimelineToDBError || error instanceof UpdateResumeScreeningInDBError || error instanceof UpdateApplicationInDBError) {
            return c.json({ success: false, message: error.message, error: error.cause }, 400)
        }
        return c.json({ success: false, message: 'Something went wrong' }, 500)
    }
})

export default roundRouter;