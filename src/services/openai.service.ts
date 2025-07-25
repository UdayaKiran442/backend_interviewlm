import OpenAI from "openai";
import { ActiveConfig } from "../utils/config.utils";

const openai = new OpenAI({
    apiKey: ActiveConfig.OPENAI_API_KEY,
})

export async function generateEmbeddings(text: string) {
    try {
        const embeddings = await openai.embeddings.create({
            model: "text-embedding-3-small",
            input: text,
        })
        return embeddings.data[0].embedding
    } catch (error) {
        console.log(error)
    }
}