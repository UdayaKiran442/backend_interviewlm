import OpenAI from "openai";
import { ActiveConfig } from "../utils/config.utils";
import { GenerateEmbeddingsServiceError, GenerateResumeFeedbackServiceError, GenerateResumeSummaryServiceError } from "../exceptions/openai.exceptions";

const openai = new OpenAI({
    apiKey: ActiveConfig.OPENAI_API_KEY,
})

export async function generateEmbeddingsService(text: string) {
    try {
        const embeddings = await openai.embeddings.create({
            model: "text-embedding-3-small",
            input: text,
        })
        return embeddings.data[0].embedding
    } catch (error) {
        throw new GenerateEmbeddingsServiceError('Failed to generate embeddings', { cause: (error as Error).message });
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
        throw new GenerateResumeSummaryServiceError('Failed to generate resume summary', { cause: (error as Error).message });
    }
}

export async function generateResumeFeedbackService(payload: { jobDescription: string, resumeText: string }) {
    try {
        const message = [
            {
                role: "system",
                content: `
You are an expert resume evaluator specializing in assessing resumes against job descriptions. Your task is to generate **objective, structured, and concise feedback** based strictly on the match between the candidate’s resume and the job description.

Follow these strict rules:

1. Generate a brief **AI Summary** of the resume's fit for the job (max 3-4 lines).
2. Provide **match percentages** as integers (0–100) for the following:
   - keywordMatch: Based on overlap of technical and domain-specific terms.
   - experienceMatch: Based on years and relevance of prior experience.
   - skillMatch: Based on core technical and soft skills.
3. Generate an overall **aiScore** (0–100) representing the resume’s suitability for the job.
4. List **strengths** of the candidate relevant to the job.
5. List **concerns** or missing areas — exclude salary, location, overqualification, or irrelevant issues.
6. Provide a final **aiRecommendation**: must be one of:
   - "Hire"
   - "Not Hire"
   - "Human Review"
7. Strictly return the result in the following **valid JSON** format:
{
  "feedback": "string", 
  "keywordMatch": number, 
  "experienceMatch": number, 
  "skillMatch": number, 
  "aiScore": number, 
  "strengths": ["string"], 
  "concerns": ["string"], 
  "aiRecommendation": "Hire" | "Not Hire" | "Human Review"
}
8. Review like a human and a tech expert and provide genuine feedback.
  Job description: ${payload.jobDescription}
  Resume text: ${payload.resumeText}


Avoid any extra explanation outside of the JSON. Respond with the JSON object only.
    `
            }
        ]

        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini-2024-07-18",
            messages: message as OpenAI.Chat.Completions.ChatCompletionMessageParam[],
            temperature: 0
        })
        return JSON.parse(response.choices[0].message.content ?? "");
    } catch (error) {
        throw new GenerateResumeFeedbackServiceError('Failed to generate resume feedback', { cause: (error as Error).cause })
    }
}