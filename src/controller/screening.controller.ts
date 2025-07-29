import { IFetchResumeScreeningDetailsSchema, IFetchScreeningResumesSchema } from "../routes/v1/screening.route";
import { FetchResumeScreeningDetailsError, FetchScreeningResumesError, GetResumeScreeningDetailsFromDBError, GetScreeningResumesFromDBError, UpdateFeedbackInDBError } from "../exceptions/screening.exceptions";
import { getResumeScreeningDetailsFromDB, getScreeningResumesFromDB, updateFeedbackInDB } from "../repository/resumeScreening/resumeScreening.repository";
import { generateEmbeddingsService, generateResumeFeedbackService } from "../services/openai.service";
import { queryVectorEmbeddingsService } from "../services/pinecone.service";
import { ActiveConfig } from "../utils/config.utils";
import { GenerateEmbeddingsServiceError, GenerateResumeFeedbackServiceError } from "../exceptions/openai.exceptions";
import { QueryVectorEmbeddingsServiceError } from "../exceptions/pinecone.exceptions";
import { NotFoundError } from "../exceptions/common.exceptions";

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

export async function fetchResumeScreeningDetails(payload: IFetchResumeScreeningDetailsSchema) {
    try {
        // check if feedback is present or not
        const resumeScreeningDetails = await getResumeScreeningDetailsFromDB(payload)
        if (resumeScreeningDetails.length === 0) {
            throw new NotFoundError('Resume screening details not found');
        }

        // if not present, generate feedback from llm
        if (!resumeScreeningDetails[0].feedback) {
            // generate feedback from llm and update in db
            const feedback = await generateResumeFeedbackService({
                jobDescription: resumeScreeningDetails[0].jobDescription ?? '',
                resumeText: resumeScreeningDetails[0].resumeText ?? ''
            })
            // TODO: update feedback in db in background
            await updateFeedbackInDB({
                screeningId: resumeScreeningDetails[0].screeningId,
                feedback: feedback
            })
            return { ...resumeScreeningDetails[0], feedback };
        }

        // if present return details
        return resumeScreeningDetails[0];
    } catch (error) {
        if (error instanceof GetResumeScreeningDetailsFromDBError || error instanceof NotFoundError || error instanceof GenerateResumeFeedbackServiceError || error instanceof UpdateFeedbackInDBError) {
            throw error
        }
        throw new FetchResumeScreeningDetailsError('Failed to fetch resume screening details', { cause: (error as Error).cause });
    }
}