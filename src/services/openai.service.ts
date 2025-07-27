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

export async function generateResumeSummary(resumeText: string) {
    try {
        const message = [
            {
                role: "system",
                content: `
You are a resume summarizer that extracts high-signal information for semantic search.

Generate a dense and structured summary from the given resume text. This summary will be embedded for querying, so focus on capturing core professional data.

Follow these rules strictly:

1. Only include details from **Work Experience**, **Skills**, **Projects**, and **Education**.
2. Exclude any **personal information** such as name, email, phone number, address, or LinkedIn.
3. Do not include any **quantitative values** like percentages, dates, or specific counts (e.g., "improved by 30%", "5 years").
4. Emphasize the candidate's **job roles**, **technical and domain-specific skills**, and **how those skills were applied** in projects and work experience.
5. Highlight **technologies, frameworks, tools, and platforms** used in projects and work experience.
6. Keep the summary factual and professional — do not make assumptions or add commentary.
7. The summary should be a single paragraph, not bullet points.
8. Group skills logically for embedding and searching.
9. Avoid vague action verbs and resume buzzwords like "optimized", "improved", "enhanced", "results-driven", "hardworking", "dynamic", "detail-oriented", unless used with specific technical context.
10. Prefer descriptive phrases like "developed REST APIs using Node.js" over generic phrases like "built scalable systems".
11. Store all the relevant skills mentioned in the resume in the skills array.
Return output in **valid JSON** format like:
{ "summary": "string", "skills": ["string"] }
    `
            },
            {
                role: "user",
                content: resumeText
            }
        ]

        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini-2024-07-18",
            messages: message as OpenAI.Chat.Completions.ChatCompletionMessageParam[],
            temperature: 1
        })
        return JSON.parse(response.choices[0].message.content ?? "");
    } catch (error) {

    }
}