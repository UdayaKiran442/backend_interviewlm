import { Hono } from "hono";
import z from "zod";
import { applyJob } from "../../controller/application.controller";
import { NotFoundError } from "../../exceptions/common.exceptions";
import { CloseJobInDBError, JobClosedError } from "../../exceptions/job.exceptions";
import { ApplyJobError, JobAlreadyAppliedError } from "../../exceptions/applications.exceptions";

const applicationsRoute = new Hono();

const ApplyJobSchema = z.object({
    jobId: z.string(),
    resumeLink: z.string(),
    resumeText: z.string(),
    coverLetterLink: z.string().optional(),
    coverLetterText: z.string().optional(),
})

export type IApplyJobSchema = z.infer<typeof ApplyJobSchema> & { candidateId: string, currentRoundId: string }

applicationsRoute.post("/job/apply", async (c) => {
    try {
        const validation = ApplyJobSchema.safeParse(await c.req.json())
        if (!validation.success) {
            throw validation.error;
        }
        const payload = {
            ...validation.data,
            candidateId: "candidate-Xh6XqZUcCt6yYpxzvl94S",
            currentRoundId: "",
        }
        const res = await applyJob(payload)
        return c.json({ success: true, message: 'Application submitted', res }, 200)
    } catch (error) {
        if (error instanceof z.ZodError) {
            const errMessage = JSON.parse(error.message)
            return c.json({ success: false, error: errMessage[0], message: errMessage[0].message }, 400)
        }
        if (error instanceof ApplyJobError || error instanceof JobClosedError || error instanceof JobAlreadyAppliedError || error instanceof CloseJobInDBError) {
            return c.json({ success: false, message: error.message, error: error.cause }, 400)
        }
        if (error instanceof NotFoundError) {
            return c.json({ success: false, message: error.message, error: error.cause }, 404)
        }
        return c.json({ success: false, message: 'Something went wrong' }, 500)
    }
})

export default applicationsRoute;