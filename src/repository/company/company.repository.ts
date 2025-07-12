import { ICompanySchema } from "../../routes/company.route";
import { generateNanoId } from "../../utils/nanoid.utils";
import db from "../db";
import { company } from "../schema";

export async function createCompanyInDB(payload: ICompanySchema) {
    try {
        const insertPayload = {
            companyId: generateNanoId(),
            name: payload.name,
            location: payload.location,
            createdAt: new Date(),
            updatedAt: new Date(),
        }
        await db.insert(company).values(insertPayload)
        return insertPayload;
    } catch (error) {

    }
}