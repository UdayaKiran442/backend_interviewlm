import db from "../db";
import { candidates } from "../schema";
import { eq } from "drizzle-orm";
import { GetCandidateByEmailFromDBError, AddCandidateInDBError, GetCandidateByIDFromDBError, OnBoardCandidateInDBError, UpdateCandidateJobsInDBError } from "../../exceptions/candidate.exceptions";
import { IOnboardingSchema } from "../../routes/v1/candidate.route";
import { generateNanoId } from "../../utils/nanoid.utils";
import { dbTx } from "../db.types";
import { IAuthSchema } from "../../routes/v1/auth.route";

export async function getCandidateByEmailFromDB(email: string) {
    try {
        return await db.select().from(candidates).where(eq(candidates.email, email))
    } catch (error) {
        throw new GetCandidateByEmailFromDBError('Failed to get candidate by email from DB', { cause: (error as Error).cause });
    }
}

export async function getCandidateByIDFromDB(candidateId: string, tx?: dbTx) {
    try {
        const dbConnection = tx || db;
        return await dbConnection.select().from(candidates).where(eq(candidates.candidateId, candidateId))
    } catch (error) {
        throw new GetCandidateByIDFromDBError('Failed to get candidate by ID from DB', { cause: (error as Error).cause });
    }
}

export async function onBoardCandidateInDB(payload: IOnboardingSchema) {
    try {
        const updatePayload = {
            ...payload,
            isOnboardingCompleted: true,
            updatedAt: new Date(),
        }
        await db.update(candidates).set(updatePayload).where(eq(candidates.candidateId, payload.candidateId))
    } catch (error) {
        throw new OnBoardCandidateInDBError('Failed to update candidate in DB', { cause: (error as Error).cause });
    }
}

export async function addCandidateInDB(payload: IAuthSchema) {
    try {
        const insertPayload = {
            candidateId: `candidate-${generateNanoId()}`,
            email: payload.email,
            userId: payload.userId,
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

export async function updateCandidateJobsInDB(payload: { candidateId: string, jobs: string[] }, tx?: dbTx) {
    try {
        const dbConnection = tx || db;
        await dbConnection.update(candidates).set({ jobs: payload.jobs }).where(eq(candidates.candidateId, payload.candidateId))
    } catch (error) {
        throw new UpdateCandidateJobsInDBError('Failed to update candidate jobs in DB', { cause: (error as Error).cause });
    }
}    