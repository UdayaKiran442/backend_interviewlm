import { Hono } from "hono";
import z from "zod";

const questionRoute = new Hono();

const NextQuestionSchema = z.object({
	interviewId: z.string(),
    jobId: z.string(),
});

export type INextQuestionSchema = z.infer<typeof NextQuestionSchema> & { candidateId: string };

questionRoute.post("/next", async (c) => {
	try {
        const validation = NextQuestionSchema.safeParse(await c.req.json());
        if(!validation.success) {
            throw validation.error
        }

	} catch (error) {
        if(error instanceof z.ZodError) {
            const errMessage = JSON.parse(error.message)
            return c.json({ success: false, error: errMessage[0], message: errMessage[0].message }, 400)
        }
    }
});

export default questionRoute;
