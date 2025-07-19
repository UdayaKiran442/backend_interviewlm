import { Hono } from "hono";
import z from "zod";
import { applyJob } from "../../controller/application.controller";

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

    }
})

export default applicationsRoute;