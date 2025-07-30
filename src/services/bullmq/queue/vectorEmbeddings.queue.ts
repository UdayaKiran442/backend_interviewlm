import { Queue } from "bullmq"
import { VECTOR_EMBEDDINGS_QUEUE } from "../../../constants/constants"

const vectorEmbeddingsQueue = new Queue(VECTOR_EMBEDDINGS_QUEUE)

export default vectorEmbeddingsQueue
