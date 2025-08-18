/**
 * ICreatRoundInDB
 *
 * @description This type is input payload used to create a round in the database
 */

export type ICreatRoundInDB = {
	jobId: string;
	roundNumber: number;
	roundType: string;
	questionType: string | undefined;
	duration: number | undefined;
	difficulty: string | undefined;
	roundDescription: string | undefined;
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
	package: string | undefined;
	maximumApplications: number | undefined;
	companyId: string;
	location: string | undefined;
};

export type ICreateQuestionInDB = {
	interviewId: string;
	question: string;
};

export type IUpdateInterviewInDB = {
	interviewId: string;
	applicationId?: string;
	roundId?: string;
	roundResultsId?: string;
	status?: string;
};

export type IUpdateQuestionInDB = {
	questionId: string;
	interviewId?: string;
	question?: string;
	answer?: string;
	feedback?: string;
	isDisplayed?: boolean;
};