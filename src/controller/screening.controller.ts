import { IFetchScreeningResumesSchema } from "../routes/v1/screening.route";
import { FetchScreeningResumesError, GetScreeningResumesFromDBError } from "../exceptions/screening.exceptions";
import { getScreeningResumesFromDB } from "../repository/resumeScreening/resumeScreening.repository";
import { generateEmbeddingsService } from "../services/openai.service";
import { queryVectorEmbeddingsService } from "../services/pinecone.service";
import { ActiveConfig } from "../utils/config.utils";
import { GenerateEmbeddingsServiceError } from "../exceptions/openai.exceptions";
import { QueryVectorEmbeddingsServiceError } from "../exceptions/pinecone.exceptions";

export async function fetchScreeningResumes(payload: IFetchScreeningResumesSchema) {
    try {
        // call db function
        const resumes = await getScreeningResumesFromDB(payload)
        if (payload.prompt) {
            // convert prompt to vector embeddings
            const promptEmbeddings = await generateEmbeddingsService(payload.prompt);

            // compare vector embeddings to resumes index and filter by jobId
            const queryResponse = await queryVectorEmbeddingsService({
                indexName: ActiveConfig.RESUME_INDEX,
                jobId: payload.jobId,
                vector: promptEmbeddings ?? [],
            })
            const applicationIds = queryResponse?.matches?.map((match) => match.metadata?.applicationId)
            return resumes?.filter((resume) => applicationIds?.includes(resume.resume_screening.applicationId))
        }
        return resumes;
    } catch (error) {
        if (error instanceof GenerateEmbeddingsServiceError || error instanceof QueryVectorEmbeddingsServiceError || error instanceof GetScreeningResumesFromDBError) {
            throw error;
        }
        throw new FetchScreeningResumesError('Failed to fetch screening resumes', { cause: (error as Error).cause });
    }
}