import { Hono } from "hono";
import z from "zod";
import { createCompany } from "../controller/company.controller";

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
    const validation = CompanySchema.safeParse(c.req.json())
    if (!validation.success) {
        throw validation.error;
    }
    const company = await createCompany(validation.data);
    return c.json({ success: true, message: 'Company created', company })
})

export default companyRoute;