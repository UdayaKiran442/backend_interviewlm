import * as path from "path";
import { CreateJobInDBError, CreateJobError, CloseJobInDBError, GetJobByIdFromDBError, CloseJobError } from "../exceptions/job.exceptions";
import { closeJobInDB, createJobInDB, getJobByIdFromDB } from "../repository/job/job.repository";
import type { ICloseJobSchema, ICreateJobSchema } from "../routes/v1/job.route";
import { createRoundInDB } from "../repository/rounds/rounds.repository";
import { CreateRoundInDBError } from "../exceptions/round.exceptions";
import { getHRFromDB } from "../repository/hr/hr.repository";
import { NotFoundError, UnauthorizedError } from "../exceptions/common.exceptions";
import { GetHRFromDBError } from "../exceptions/hr.exceptions";
import { ActiveConfig } from "../utils/config.utils";
import { UpsertVectorEmbeddingsError, UpsertVectorEmbeddingsServiceError } from "../exceptions/pinecone.exceptions";
import { GenerateEmbeddingsServiceError } from "../exceptions/openai.exceptions";
import db from "../repository/db";
import type { dbTx } from "../repository/db.types";

export async function createJob(payload: ICreateJobSchema) {
	const upsertVectorEmbeddingsWorker = new Worker(path.resolve(__dirname, "../worker/upsertVectorEmbeddings.worker.ts"));
	try {
		// create job and generate embeddings for job description
		const result = db.transaction(async (tx: dbTx) => {
			const newJob = await createJobInDB({
				companyId: payload.companyId,
				department: payload.department,
				hrId: payload.hrId,
				jobDescription: payload.jobDescription,
				jobTitle: payload.jobTitle,
				maximumApplications: payload.maximumApplications,
				package: payload.package,
				location: payload.location,
				jobReviewers: payload.jobReviewers,
			});
			upsertVectorEmbeddingsWorker.postMessage({
				indexName: ActiveConfig.JD_INDEX,
				text: payload.jobDescription,
				metadata: {
					jobId: newJob.jobId,
				},
			});

			// add rounds in db
			// TODO: Future run this in background if possible
			const newRounds = await createRoundInDB(
				payload.rounds.map((round) => {
					return {
						jobId: newJob.jobId,
						roundNumber: round.roundNumber,
						roundName: round.roundName,
						roundType: round.roundType,
						questionType: round.questionType,
						duration: round.duration,
						difficulty: round.difficulty,
						roundDescription: round.roundDescription,
						isAI: round.isAI,
					};
				}, tx),
			);

			// return job
			return {
				job: newJob,
				rounds: newRounds,
			};
		});
		return result;
	} catch (error) {
		if (
			error instanceof CreateJobInDBError ||
			error instanceof CreateRoundInDBError ||
			error instanceof UpsertVectorEmbeddingsServiceError ||
			error instanceof GenerateEmbeddingsServiceError ||
			error instanceof UpsertVectorEmbeddingsError
		) {
			throw error;
		}
		throw new CreateJobError("Failed to create job", { cause: (error as Error).message });
	}
}

export async function closeJob(payload: ICloseJobSchema) {
	try {
		// Fetch job and HR details
		const [job, hr] = await Promise.all([getJobByIdFromDB(payload.jobId), getHRFromDB(payload.hrId)]);

		if (job.length === 0) {
			throw new NotFoundError("Job not found");
		}
		if (hr.length === 0) {
			throw new NotFoundError("HR not found");
		}

		const isOrgAdminOfSameCompany = hr[0].isOrgAdmin && job[0].companyId === hr[0].companyId;
		const isJobOwner = job[0].hrId === payload.hrId;

		// Only job added by HR or org admin of same company can close the job
		if (!isOrgAdminOfSameCompany && !isJobOwner) {
			throw new UnauthorizedError("You are not authorized to close this job");
		}

		await closeJobInDB(payload.jobId);
	} catch (error) {
		if (error instanceof NotFoundError || error instanceof UnauthorizedError || error instanceof CloseJobInDBError || error instanceof GetJobByIdFromDBError || error instanceof GetHRFromDBError) {
			throw error;
		}
		throw new CloseJobError("Failed to close job", { cause: (error as Error).message });
	}
}
