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
You are an expert technical recruiter and resume evaluator with deep knowledge across multiple industries. Analyze the provided resume against the job description with the precision of a senior hiring manager.

**ANALYSIS FRAMEWORK:**

1. **AI Summary** (3-4 sentences max):
   - Overall fit assessment
   - Key strengths alignment
   - Critical gaps (if any)

2. **Scoring Criteria** (0-100 scale):
   - **keywordMatch**: Technical terms, tools, technologies, certifications, and domain-specific language overlap
   - **experienceMatch**: Years of experience, role progression, industry relevance, and responsibility level alignment
   - **skillMatch**: Hard skills, soft skills, and competency alignment with job requirements
   - **aiScore**: Weighted overall suitability (keywordMatch: 30%, experienceMatch: 30%, skillMatch: 40%)

3. **Evaluation Focus:**
   - **Strengths**: Highlight 3-5 most relevant qualifications that directly match job requirements
   - **Concerns**: Identify genuine skill gaps, **experience shortfalls**, or missing critical requirements only. **DO NOT include:** salary expectations, location preferences, overqualification concerns, or minor skill variations if the core competency is demonstrated through projects/experience.

4. **Recommendation Logic:**
   - **"Hire"**
   - **"Human Review"**
   - **"Not Hire"**

**QUALITY STANDARDS:**
- Base analysis on explicit resume content and clear job requirements
- Infer skills only when clearly demonstrated through described work/projects
- Consider career level appropriately (junior vs senior expectations)
- Focus on role-critical requirements over nice-to-haves

**INPUT DATA:**
Job Description: ${payload.jobDescription}
Resume Content: ${payload.resumeText}

**OUTPUT FORMAT** (JSON only, no additional text):
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