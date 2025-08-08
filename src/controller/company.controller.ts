import { CreateCompanyError, CreateCompanyInDBError } from "../exceptions/company.exceptions";
import { CreateHRInDBError } from "../exceptions/hr.exceptions";
import { createCompanyInDB } from "../repository/company/company.repository";
import { createHRInDB } from "../repository/hr/hr.repository";
import { ICompanySchema } from "../routes/v1/company.route";

export async function createCompany(payload: ICompanySchema) {
    try {
        const company = await createCompanyInDB(payload);
        // TODO: send email invite to hr, run functions in background
        await createHRInDB({
            companyId: company?.companyId ?? '',
            name: payload.hrName,
            email: payload.hrEmail,
            phone: payload.hrPhone,
            userId: payload.userId,
            isOrgAdmin: true,
        })
        return company;
    } catch (error) {
        if (error instanceof CreateCompanyInDBError || error instanceof CreateHRInDBError) {
            throw error;
        }
        throw new CreateCompanyError('Failed to create company', { cause: (error as Error).message });
    }
}