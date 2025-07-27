import { GenerateEmbeddingsServiceError } from "../exceptions/openai.exceptions";
import { UpsertVectorEmbeddingsError, UpsertVectorEmbeddingsServiceError } from "../exceptions/pinecone.exceptions";
import { generateEmbeddingsService } from "../services/openai.service";
import { upsertVectorEmbeddingsService } from "../services/pinecone.service";

export async function upsertVectorEmbeddings(payload: { indexName: string, text: string, metadata: any }) {
    try {
        const embeddings = await generateEmbeddingsService(payload.text);
        if (embeddings) {
            await upsertVectorEmbeddingsService({
                indexName: payload.indexName,
                vector: embeddings,
                metadata: payload.metadata
            })
        }
        return embeddings
    } catch (error) {
        if (error instanceof UpsertVectorEmbeddingsServiceError || error instanceof GenerateEmbeddingsServiceError) {
            throw error;
        }
        throw new UpsertVectorEmbeddingsError('Failed to upsert vector embeddings', { cause: (error as Error).cause });
    }
}