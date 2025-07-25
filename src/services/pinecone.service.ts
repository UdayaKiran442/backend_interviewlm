import { Pinecone } from '@pinecone-database/pinecone'
import { ActiveConfig } from '../utils/config.utils'

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
        console.log(error)
    }
}

export async function queryVectorEmbeddings(payload: { indexName: string, vector: number[], jobId: string }) {
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

    }
}

