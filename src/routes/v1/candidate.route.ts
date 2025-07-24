import { Hono } from "hono";
import z from "zod";
import { loginCandidate, onboardingCandidate } from "../../controller/candidate.controller";
import { AddUserInDBError, GetUserByEmailFromDBError } from "../../exceptions/user.exceptions";
import { AddCandidateInDBError, GetCandidateByEmailFromDBError, GetCandidateByIDFromDBError, LoginCandidateError, UpdateCandidateError, UpdateCandidateInDBError } from "../../exceptions/candidate.exceptions";

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
        return c.json({ success: true, message: 'Candidate logged in', candidate, role: 'candidate' }, 200)
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


const OnboardingSchema = z.object({
    firstName: z.string().nullish(),
    middleName: z.string().nullish(),
    lastName: z.string().nullish(),
    phone: z.string().nullish(),
    location: z.string().nullish(),
    linkedInProfile: z.string().nullish(),
    githubProfile: z.string().nullish(),
    portfolio: z.string().nullish(),
    experience: z.array(z.object({
        company: z.string(),
        position: z.string(),
        startDate: z.string(),
        endDate: z.string().nullish(),
        description: z.string().nullish(),
    })).nullish(),
    workAuthorization: z.string().nullish(),
    willingToRelocate: z.boolean().nullish(),
    isOpenToRemote: z.boolean().nullish(),
    resumeLink: z.string().nullish(),
    acceptedTermsAndConditions: z.boolean().nullish(),
    receiveUpdatesOnApplication: z.boolean().nullish(),
})

export type IOnboardingSchema = z.infer<typeof OnboardingSchema> & {
    candidateId: string;
    resumeText?: string;
}


candidateRouter.post("/onboarding", async (c) => {
    try {
        const validation = OnboardingSchema.safeParse(await c.req.json())
        if (!validation.success) {
            throw validation.error
        }
        const payload = {
            ...validation.data,
            candidateId: "candidate-Xh6XqZUcCt6yYpxzvl94S"
        }
        await onboardingCandidate(payload)
        return c.json({ success: true, message: 'Candidate onboarding completed', payload }, 200)
    } catch (error) {
        if (error instanceof z.ZodError) {
            const errMessage = JSON.parse(error.message)
            return c.json({ success: false, error: errMessage[0], message: errMessage[0].message }, 400)
        }
        if (error instanceof GetCandidateByIDFromDBError || error instanceof UpdateCandidateInDBError || error instanceof UpdateCandidateError) {
            return c.json({ success: false, message: error.message, error: error.cause }, 400)
        }
        return c.json({ success: false, message: 'Something went wrong' }, 500)
    }
})

export default candidateRouter;
