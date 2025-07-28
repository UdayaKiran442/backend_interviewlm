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
        if (payload.prompt) {
            // convert prompt to vector embeddings
            const promptEmbeddings = await generateEmbeddingsService(payload.prompt);

            // compare vector embeddings to resumes index and filter by jobId
            const queryResponse = await queryVectorEmbeddingsService({
                indexName: ActiveConfig.RESUME_INDEX,
                jobId: payload.jobId,
                vector: promptEmbeddings ?? [],
            })
            const filteredResumes = await getScreeningResumesFromDB(payload)
            // replace matchScore with score from queryResponse
            // Build a map from applicationId to score
            const matchScoreMap = new Map<string | number | true | string[], number>();
            queryResponse?.matches?.forEach((match) => {
                if (match.metadata?.applicationId) {
                    matchScoreMap.set(match.metadata.applicationId, match?.score ?? 0);
                }
            });

            // Assign matchScore using the map
            filteredResumes?.forEach((resume) => {
                resume.matchScore = matchScoreMap.get(resume.applicationId) ?? 0;
            });
            return filteredResumes
        }
        return await getScreeningResumesFromDB(payload);
    } catch (error) {
        if (error instanceof GenerateEmbeddingsServiceError || error instanceof QueryVectorEmbeddingsServiceError || error instanceof GetScreeningResumesFromDBError) {
            throw error;
        }
        throw new FetchScreeningResumesError('Failed to fetch screening resumes', { cause: (error as Error).cause });
    }
}