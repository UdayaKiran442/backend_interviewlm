import type { IGenerateInterviewFeedbackService } from "../types/prompt.types";

export function generateQuestionsPromptForJDandResume(payload: { resumeText: string; jobDescription: string; difficulty: string }) {
	return `
				You are a technical interviewer.

				Given the following candidate resume and job description, generate exactly 3 unique interview questions. Each question should:
				- Be relevant to the candidate's resume and/or the job description.
				- At least one question must focus solely on required skills from the job description, even if not present in the resume.

				Return ONLY the questions in the following strict JSON format:
				{
				"response": []
				}

				Resume:
				${payload.resumeText}

				Job Description:
				${payload.jobDescription}

				Difficulty:
				${payload.difficulty}

				[CACHE_BYPASS]: ${Date.now()}
				`;
}

export function generateQuestionsPromptForJD(payload: { jobDescription: string; difficulty: string }) {
	return `
				You are a technical interviewer.

				Given the following job description, generate exactly 3 unique interview questions. Each question should:
				- Be relevant to the job description.

				Return ONLY the questions in the following strict JSON format:
				{
				"response": []
				}

				Job Description:
				${payload.jobDescription}

				Difficulty:
				${payload.difficulty}

				[CACHE_BYPASS]: ${Date.now()}
				`;
}

export function generateFollowUpQuestionPromptForJDandResume(payload: { resumeText: string; jobDescription: string; difficulty: string; response: string }) {
	return `
	You are acting as a **technical interviewer**.  
	Your task is to generate exactly **one follow-up question** based on the candidate’s resume, the job description, and their previous response. \n

	### Rules:
	1. The question must be **relevant to the candidate's resume and/or the job description**.  
	2. If the candidate's previous response is incomplete, or indicates no knowledge (e.g., "no idea", "not sure"), already comprehensive (the answer fully addresses the question with no meaningful scope for further probing), then generate a **new relevant question** instead of a follow-up.  
	3. Match the difficulty level provided: "${payload.difficulty}".  
	4. Avoid open-ended or generic questions — keep them precise, technical, and measurable.  
	5. Return the result in **valid JSON** only. No explanations, no additional text.

	### Output JSON format:
	{
		"response": "string" // the generated question
	}

	### Candidate Resume:
	${payload.resumeText}

	### Job Description:
	${payload.jobDescription}

	### Previous Candidate Response:
	${payload.response}
	`;
}

export function generateFollowUpQuestionPromptForJD(payload: { jobDescription: string; difficulty: string; response: string }) {
	return `
	You are acting as a **technical interviewer**.  
	Your task is to generate exactly **one follow-up question** based on the job description, and their previous response. \n

	### Rules:
	1. The question must be **relevant to the job description**.  
	2. If the candidate's previous response is incomplete, or indicates no knowledge (e.g., "no idea", "not sure"), already comprehensive (the answer fully addresses the question with no meaningful scope for further probing), then generate a **new relevant question** instead of a follow-up.  
	3. Match the difficulty level provided: "${payload.difficulty}".  
	4. Avoid open-ended or generic questions — keep them precise, technical, and measurable.  
	5. Return the result in **valid JSON** only. No explanations, no additional text.

	### Output JSON format:
	{
		"response": "string" // the generated question
	}

	### Job Description:
	${payload.jobDescription}

	### Previous Candidate Response:
	${payload.response}
	`;
}

export function generateFeedbackToQuestionPrompt(payload: { answerText: string; questionText: string; resumeText: string }) {
	return `You are a technical interviewer.
                A candidate answered a question for interview, generate a valid feedback based on the answer given by candidate.
                In feedback, include the following:
                - Clarity of explanation
                - Technical accuracy and depth
                - Areas to improve if any
                - Any other relevant points you think are important  

Question: ${payload.questionText}  
Answer: ${payload.answerText}  
Resume: ${payload.resumeText}  

Give feedback in single sentence.

Return ONLY the feedback in the following strict JSON format:
{
  "response": "feedback_text"
}

[CACHE_BYPASS]: ${Date.now()}`;
}

export function generateInterviewFeedbackPrompt(payload: IGenerateInterviewFeedbackService) {
	return `
		You are a technical interviewer.
		Based on the following questions and feedback, generate a valid interview feedback.

		 In feedback, include the following:
                - Clarity of explanation
                - Technical accuracy and depth
                - Communication
                - Areas to improve if any
                - Any other relevant points you think are important
                - Vertict on whether to qualify candidate to next round or not

		### Input:
		${payload.map((item) => `Question: ${item.questionText}\nAnswer: ${item.answerText}\nFeedback: ${item.feedback}`).join("\n\n")}

		### Output:
		 {
            "response": {
                "feedback": "An overall summary on candidate performance",
                "qualify": true/false,
                "aiScore": 0-100,
                "keyPoints"(strenghts of candidate): ["point1", "point2", "point3"],
                "concerns"(weaknesses of candidate): ["concern1", "concern2", "concern3"],
                "verdictReason":"Short reason for the verdict"
            } 
        }
	`;
}
