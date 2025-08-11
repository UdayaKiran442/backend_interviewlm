import { generateNanoId } from "../../utils/nanoid.utils";
import db from "../db";
import { rounds } from "../schema";
import { CreateRoundInDBError, GetRoundByIdFromDBError, GetRoundsByJobIdFromDBError } from "../../exceptions/round.exceptions";
import { ICreatRoundInDB } from "../../types/types";
import { and, eq } from "drizzle-orm";
import { dbTx } from "../db.types";

export async function createRoundInDB(payload: ICreatRoundInDB, tx?: dbTx) {
    try {
        const dbConnection = tx || db;
        const insertPayload = payload.map((round) => {
            return {
                roundId: `round-${generateNanoId()}`,
                jobId: round.jobId,
                roundNumber: round.roundNumber,
                roundType: round.roundType,
                questionType: round.questionType,
                duration: round.duration,
                difficulty: round.difficulty,
                roundDescription: round.roundDescription,
                isAI: round.isAI,
                createdAt: new Date(),
                updatedAt: new Date(),
            }
        })
        await dbConnection.insert(rounds).values(insertPayload)
        return insertPayload;
    } catch (error) {
        throw new CreateRoundInDBError('Failed to create round in DB', { cause: (error as Error).message });
    }
}

export async function getRoundsByJobIdFromDB(jobId: string, roundNumber?: number) {
    try {
        if (roundNumber) {
            return await db.select().from(rounds).where(and(eq(rounds.jobId, jobId), eq(rounds.roundNumber, roundNumber)))
        }
        return await db.select().from(rounds).where(eq(rounds.jobId, jobId))
    } catch (error) {
        throw new GetRoundsByJobIdFromDBError('Failed to get rounds by job id', { cause: (error as Error).message });
    }
}

export async function getRoundByIdFromDB(roundId: string, tx?: dbTx) {
    try {
        const dbConnection = tx || db;
        return await dbConnection.select().from(rounds).where(eq(rounds.roundId, roundId))
    } catch (error) {
        throw new GetRoundByIdFromDBError('Failed to get round by id', { cause: (error as Error).message });
    }
}