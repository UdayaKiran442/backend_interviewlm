import { Worker } from "bullmq";
import { upsertVectorEmbeddings } from "../../../utils/upsertVectorDb.utils";
import redisService from "../../upstash/redis/redis.service";
import { VECTOR_EMBEDDINGS_QUEUE } from "../../../constants/constants";



const worker = new Worker(VECTOR_EMBEDDINGS_QUEUE, async (job) => {
    await upsertVectorEmbeddings({
        indexName: job.data.indexName,
        text: job.data.jobDescription,
        metadata: {
            jobId: job.data.jobId,
        }
    })
}, { connection: redisService as any })

export default worker