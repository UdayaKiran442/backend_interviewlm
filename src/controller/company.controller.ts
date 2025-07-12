import { createCompanyInDB } from "../repository/company/company.repository";
import { createHRInDB } from "../repository/hr/hr.repository";
import { ICompanySchema } from "../routes/company.route";

export async function createCompany(payload: ICompanySchema){
    try {
        const company = await createCompanyInDB(payload);
        // TODO: send email invite to hr, run functions in background
        const hr = await createHRInDB({
            companyId: company?.companyId ?? '',
            name: payload.hrName,
            email: payload.hrEmail,
            phone: payload.hrPhone,
            isOrgAdmin: true,
        })
        return company;
    } catch (error) {
        
    }
}