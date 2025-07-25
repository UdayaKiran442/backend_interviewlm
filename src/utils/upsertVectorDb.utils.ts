import { generateEmbeddings } from "../services/openai.service";
import { upsertVectorEmbeddingsService } from "../services/pinecone.service";

export async function upsertVectorEmbeddings(payload: { indexName: string, text: string, metadata: any }) {
    try {
        const embeddings = await generateEmbeddings(payload.text);
        if (embeddings) {
            await upsertVectorEmbeddingsService({
                indexName: payload.indexName,
                vector: embeddings,
                metadata: payload.metadata
            })
        }
        return embeddings
    } catch (error) {
        console.log(error)
    }
}