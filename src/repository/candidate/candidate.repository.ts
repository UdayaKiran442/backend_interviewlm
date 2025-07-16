import db from "../db";
import { candidates } from "../schema";
import { eq } from "drizzle-orm";
import { GetCandidateByEmailFromDBError, AddCandidateInDBError } from "../../exceptions/candidate.exceptions";
import { ILoginSchema } from "../../routes/v1/candidate.route";
import { generateNanoId } from "../../utils/nanoid.utils";

export async function getCandidateByEmailFromDB(email: string){
    try {
        return await db.select().from(candidates).where(eq(candidates.email, email))
    } catch (error) {
        throw new GetCandidateByEmailFromDBError('Failed to get candidate by email from DB', { cause: (error as Error).cause });
    }
}

export async function addCandidateInDB(payload: ILoginSchema) {
    try {
        const insertPayload = {
            candidateId: `candidate-${generateNanoId()}`,
            email: payload.email,
            isOnboardingCompleted: false,
            createdAt: new Date(),
            updatedAt: new Date(),
        }
        await db.insert(candidates).values(insertPayload)
        return insertPayload;
    } catch (error) {
        throw new AddCandidateInDBError('Failed to add candidate in DB', { cause: (error as Error).cause });
    }
}
    