import OpenAI from "openai";
import { ActiveConfig } from "../utils/config.utils";
import { GenerateEmbeddingsServiceError, GenerateQuestionsServiceError, GenerateResumeFeedbackServiceError, GenerateResumeSkillsServiceError } from "../exceptions/openai.exceptions";
import { generateQuestionsPromptForJD, generateQuestionsPromptForJDandResume } from "../constants/prompts.constants";

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

export async function generateResumeSkills(resumeText: string) {
    try {
        const message = [
            {
                role: "system",
                content: `
You are a resume summarizer that extracts skills from resume.

Follow the instructions:
1. Extract all the skills mentioned in the resume either implicitly or explicitly.
2. Save all the skills in the skills array.

Return output in **valid JSON** format like:
{ "skills": ["string"] }
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
        throw new GenerateResumeSkillsServiceError('Failed to generate resume summary', { cause: (error as Error).message });
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

export async function generateQuestionsService(payload: { resumeText: string, jobDescription: string, questionType: string, difficulty: string }) {
    try {
        let message: OpenAI.Chat.Completions.ChatCompletionMessageParam[] | undefined
        switch (payload.questionType) {
            case "jd+resume":
                message = [
                    {
                        role: "system",
                        content: generateQuestionsPromptForJDandResume({ resumeText: payload.resumeText, jobDescription: payload.jobDescription, difficulty: payload.difficulty })
                    }
                ]
                break;
            case "jd":
                message = [
                    {
                        role: "system",
                        content: generateQuestionsPromptForJD({ jobDescription: payload.jobDescription, difficulty: payload.difficulty })
                    }
                ]
                break;
            default:
                break;
        }
        if (message) {
            const response = await openai.chat.completions.create({
                model: "gpt-4o-mini-2024-07-18",
                messages: message,
                temperature: 1,
                top_p: 1,
            })
            return JSON.parse(response.choices[0].message.content ?? "");
        }
    } catch (error) {
        throw new GenerateQuestionsServiceError('Failed to generate questions from llm', { cause: (error as Error).cause })
    }
}