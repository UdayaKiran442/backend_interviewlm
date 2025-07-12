import { Hono } from "hono";
import z from "zod";
import { createCompany } from "../controller/company.controller";
import { CreateCompanyError, CreateCompanyInDBError } from "../exceptions/company.exceptions";
import { CreateHRInDBError } from "../exceptions/hr.exceptions";

const companyRoute = new Hono();

const CompanySchema = z.object({
    name: z.string(),
    location: z.string(),
    hrName: z.string(),
    hrEmail: z.string().email(),
    hrPhone: z.string(),
})

export type ICompanySchema = z.infer<typeof CompanySchema>

companyRoute.post('/create', async (c) => {
    try {
        const validation = CompanySchema.safeParse(await c.req.json())
        if (!validation.success) {
            throw validation.error;
        }
        const company = await createCompany(validation.data);
        return c.json({ success: true, message: 'Company created', company }, 200)
    } catch (error) {
        if (error instanceof z.ZodError) {
            const errMessage = JSON.parse(error.message)
            return c.json({ success: false, error: errMessage[0], message: errMessage[0].message }, 400)
        }
        if (error instanceof CreateCompanyError || error instanceof CreateCompanyInDBError || error instanceof CreateHRInDBError) {
            return c.json({ success: false, message: error.message, error: error.cause }, 400)
        }
        return c.json({ success: false, message: 'Something went wrong' }, 500)
    }
})

export default companyRoute;