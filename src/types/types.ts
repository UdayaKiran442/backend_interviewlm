/**
 * ICreatRoundInDB
 *
 * @description This type is input payload used to create a round in the database
 */

export type ICreatRoundInDB = {
	jobId: string;
	roundNumber: number;
	roundName: string;
	roundType: string;
	questionType: string | null;
	duration: number | null;
	difficulty: string | null;
	roundDescription: string | null;
	isAI: boolean;
}[];

/**
 * ICreatJobInDB
 *
 * @description This type is input payload used to create a job in the database
 */
export type ICreatJobInDB = {
	hrId: string;
	jobTitle: string;
	jobDescription: string;
	department: string;
	package: string | null;
	maximumApplications: number | null;
	companyId: string;
	location: string | null;
	jobReviewers: string[] | undefined;
};

export type ICreateQuestionInDB = {
	interviewId: string;
	question: string;
	isDisplayed: boolean;
};

export type ICreateInterviewInDB = {
	applicationId: string;
	roundId: string;
	roundResultsId: string | null;
	jobId: string;
	status: string;
	jobDescription: string;
	resumeText: string;
	questionType: string | null;
	difficulty: string | null;
};

export type IUpdateInterviewInDB = {
	interviewId: string;
	applicationId?: string;
	roundId?: string;
	roundResultsId?: string;
	status?: string;
	jobDescription?: string;
	resumeText?: string;
	questionType?: string;
	difficulty?: string;
};

export type IUpdateQuestionInDB = {
	questionId: string;
	interviewId?: string;
	question?: string;
	answer?: string;
	feedback?: string;
	isDisplayed?: boolean;
};

export type IUpdateUserInDB = {
	userId: string;
	email?: string;
	roles?: string[];
};

export type IInsertValidationInDB = {
	reviewerId: string | null;
	interviewId: string;
	jobId: string;
	roundId: string;
	roundResultId: string;
	notes: string | null;
	status: string;
};

export type IUpdateValidationInDB = {
	validationId: string;
	reviewerId?: string | null;
	interviewId?: string;
	jobId?: string;
	roundId?: string;
	roundResultId?: string;
	notes?: string | null;
	status?: string;
};
