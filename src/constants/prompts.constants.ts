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
	return ``;
}

export function generateFollowUpQuestionPromptForJD(payload: { jobDescription: string; difficulty: string; response: string }) {
	return ``;
}
