import { generateNanoId } from "../../utils/nanoid.utils";
import { IRound } from "../schema";
import db from "../db";
import { rounds } from "../schema";
import { CreateRoundInDBError } from "../../exceptions/round.exceptions";

export async function createRoundInDB(payload: {
    jobId: string,
    roundNumber: number,
    roundType: string,
    questionType: string,
    duration: number,
    difficulty: string,
    roundDescription: string | undefined,
    isAI: boolean,
}[]) {
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