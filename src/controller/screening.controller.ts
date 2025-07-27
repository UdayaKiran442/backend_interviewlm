import { IFetchScreeningResumesSchema } from "../routes/v1/screening.route";
import { FetchScreeningResumesError } from "../exceptions/screening.exceptions";
import { getScreeningResumesFromDB } from "../repository/resumeScreening/resumeScreening.repository";
import { generateEmbeddings } from "../services/openai.service";
import { queryVectorEmbeddings } from "../services/pinecone.service";
import { ActiveConfig } from "../utils/config.utils";

export async function fetchScreeningResumes(payload: IFetchScreeningResumesSchema) {
    try {
        // call db function
        const resumes = await getScreeningResumesFromDB(payload)
        if(payload.prompt){
            // convert prompt to vector embeddings
            const promptEmbeddings = await generateEmbeddings(payload.prompt);

            // compare vector embeddings to resumes index and filter by jobId
            const queryResponse = await queryVectorEmbeddings({
                indexName: ActiveConfig.RESUME_INDEX,
                jobId: payload.jobId,
                vector: promptEmbeddings ?? [],
            })
            const applicationIds = queryResponse?.matches?.map((match) => match.metadata?.applicationId)
            return resumes?.filter((resume) => applicationIds?.includes(resume.resume_screening.applicationId))
        }
        return resumes;
    } catch (error) {
        throw new FetchScreeningResumesError('Failed to fetch screening resumes', { cause: (error as Error).cause });
    }
}