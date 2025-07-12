import { generateNanoId } from "../../utils/nanoid.utils";
import db from "../db";
import { hr } from "../schema";

export async function createHRInDB(payload: { companyId: string, name: string, email: string, phone: string, isOrgAdmin: boolean }) {
    try {
        const insertPayload = {
            hrId: generateNanoId(),
            companyId: payload.companyId,
            name: payload.name,
            email: payload.email,
            phone: payload.phone,
            isOrgAdmin: payload.isOrgAdmin,
            createdAt: new Date(),
            updatedAt: new Date(),
        }
        await db.insert(hr).values(insertPayload)
    } catch (error) {

    }
}
