import { generateNanoId } from "../../utils/nanoid.utils";
import db from "../db";
import { rounds } from "../schema";
import { CreateRoundInDBError } from "../../exceptions/round.exceptions";
import { ICreatRoundInDB } from "../../types/types";
import { eq } from "drizzle-orm";

export async function createRoundInDB(payload: ICreatRoundInDB) {
    try {
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
        await db.insert(rounds).values(insertPayload)
        return insertPayload;
    } catch (error) {
        throw new CreateRoundInDBError('Failed to create round in DB', { cause: (error as Error).cause });
    }
}

export async function getRoundsByJobIdFromDB(jobId: string) {
    try {
        return await db.select().from(rounds).where(eq(rounds.jobId, jobId))
    } catch (error) {
    }
}