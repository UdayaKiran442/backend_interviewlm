import { Pinecone } from '@pinecone-database/pinecone'
import { ActiveConfig } from '../utils/config.utils'
import { QueryVectorEmbeddingsServiceError, UpsertVectorEmbeddingsServiceError } from '../exceptions/pinecone.exceptions'

const pinecone = new Pinecone({
    apiKey: ActiveConfig.PINECONE_API_KEY,
})

export async function upsertVectorEmbeddingsService(payload: { indexName: string, vector: number[], metadata: any }) {
    try {
        const index = pinecone.index(payload.indexName)
        await index.upsert([
            {
                id: crypto.randomUUID(),
                values: payload.vector,
                metadata: payload.metadata,
            }
        ])
    } catch (error) {
        throw new UpsertVectorEmbeddingsServiceError('Failed to upsert vector embeddings', { cause: (error as Error).cause });
    }
}

export async function queryVectorEmbeddingsService(payload: { indexName: string, vector: number[], jobId: string }) {
    try {
        const index = pinecone.index(payload.indexName)
        return await index.query({
            vector: payload.vector,
            filter: {
                jobId: payload.jobId,
            },
            includeMetadata: true,
            topK: 10,
        })
    } catch (error) {
        throw new QueryVectorEmbeddingsServiceError('Failed to query vector embeddings', { cause: (error as Error).cause });
    }
}

