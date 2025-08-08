import { Hono } from "hono";
import { GetJobsByHRFromDBError } from "../../exceptions/job.exceptions";
import { getJobsByHR } from "../../controller/hr.controller";
import { GetJobsByHRError } from "../../exceptions/hr.exceptions";
import { authMiddleware } from "../../middleware/auth.middleware";

const hrRoute = new Hono()

hrRoute.get('/jobs', authMiddleware, async (c) => {
    try {
        const hrId = c.get("user").hrId
        const jobs = await getJobsByHR(hrId)
        return c.json({ success: true, message: 'Jobs fetched successfully', jobs }, 200)
    } catch (error) {
        if (error instanceof GetJobsByHRFromDBError || error instanceof GetJobsByHRError) {
            return c.json({ success: false, message: error.message, error: error.cause }, 400)
        }
        return c.json({ success: false, message: 'Failed to fetch jobs', error: error }, 500)
    }
})

export default hrRoute;