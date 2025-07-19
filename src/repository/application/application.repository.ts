import { IApplyJobSchema } from "../../routes/v1/applicatons.route";
import { generateNanoId } from "../../utils/nanoid.utils";
import db from "../db";
import { applications } from "../schema";
import { and, eq } from "drizzle-orm";

export async function addApplicationToDB(payload: IApplyJobSchema){
    try {
        const insertPayload = {
            applicationId: `application-${generateNanoId()}`,
            candidateId: payload.candidateId,
            jobId: payload.jobId,
            resumeLink: payload.resumeLink,
            coverLetterLink: payload.coverLetterLink,
            status: "applied",
            currentRound: payload.currentRoundId,
            resumeText: payload.resumeText,
            coverLetterText: payload.coverLetterText,
            createdAt: new Date(),
            updatedAt: new Date(),
        }
        await db.insert(applications).values(insertPayload)
        return insertPayload;
    } catch (error) {
        
    }
}

export async function checkIfCandidateHasAlreadyAppliedForJob(payload: {candidateId: string, jobId: string}){
    try {
        return await db.select().from(applications).where(and(eq(applications.candidateId, payload.candidateId), eq(applications.jobId, payload.jobId)))
    } catch (error) {
        
    }
}
    