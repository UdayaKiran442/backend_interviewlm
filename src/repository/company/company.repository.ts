import { CreateCompanyInDBError } from "../../exceptions/company.exceptions";
import { ICompanySchema } from "../../routes/v1/company.route";
import { generateNanoId } from "../../utils/nanoid.utils";
import db from "../db";
import { company } from "../schema";

export async function createCompanyInDB(payload: ICompanySchema) {
    try {
        const insertPayload = {
            companyId: `company_${generateNanoId()}`,
            name: payload.name,
            location: payload.location,
            createdAt: new Date(),
            updatedAt: new Date(),
        }
        await db.insert(company).values(insertPayload)
        return insertPayload;
    } catch (error) {
        throw new CreateCompanyInDBError('Failed to create company in DB', { cause: (error as Error).message });
    }
}