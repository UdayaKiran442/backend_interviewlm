import { pgTable, boolean, varchar, integer, timestamp, json, index, real } from "drizzle-orm/pg-core";

export const company = pgTable("company", {
	companyId: varchar("companyId").primaryKey(),
	name: varchar("name").notNull(),
	location: varchar("location").notNull(),
});

export const hr = pgTable(
	"hr",
	{
		hrId: varchar("hrId").primaryKey(),
		companyId: varchar("companyId").notNull(),
		userId: varchar("userId").notNull(),
		name: varchar("name").notNull(),
		email: varchar("email").notNull(),
		phone: varchar("phone").notNull(),
		isOrgAdmin: boolean("isOrgAdmin").notNull().default(false),
	},
	(hr) => ({
		hrUserIdIndex: index("hr_user_id_idx").on(hr.userId),
	}),
);

export const jobs = pgTable(
	"jobs",
	{
		jobId: varchar("jobId").primaryKey(),
		hrId: varchar("hrId").notNull(),
		companyId: varchar("companyId").notNull(),
		jobTitle: varchar("jobTitle").notNull(),
		jobDescription: varchar("jobDescription").notNull(),
		department: varchar("department").notNull(),
		package: varchar("package"),
		location: varchar("location"),
		maximumApplications: integer("maximumApplications"),
		applications: integer("applications").notNull().default(0), // total applications
		inProgress: integer("inProgress").notNull().default(0), // applications that have done resume screening
		rejected: integer("rejected").notNull().default(0), // applications that have been rejected
		interviewing: integer("interviewing").notNull().default(0), // applications that are in interview process
		hired: integer("hired").notNull().default(0), // applications that have been hired
		isJobOpen: boolean("isJobOpen").notNull().default(true),
		isScreeningDone: boolean("isScreeningDone").notNull().default(false),
		jobReviewers: json("jobReviewers").default([]),
		createdAt: timestamp("createdAt").notNull().defaultNow(),
		updatedAt: timestamp("updatedAt").notNull().defaultNow(),
	},
	(jobs) => ({
		jobsHrIdIndex: index("jobs_hr_id_idx").on(jobs.hrId),
	}),
);

export const rounds = pgTable(
	"rounds",
	{
		roundId: varchar("roundId").primaryKey(),
		jobId: varchar("jobId").notNull(),
		roundNumber: integer("roundNumber").notNull(),
		roundType: varchar("roundType").notNull(),
		questionType: varchar("questionType"),
		duration: integer("duration"),
		difficulty: varchar("difficulty"),
		roundDescription: varchar("roundDescription"),
		isAI: boolean("isAI").notNull(),
		createdAt: timestamp("createdAt").notNull().defaultNow(),
		updatedAt: timestamp("updatedAt").notNull().defaultNow(),
	},
	(rounds) => ({
		roundsJobIdIndex: index("rounds_job_id_idx").on(rounds.jobId),
		roundsRoundNumberIndex: index("rounds_round_number_idx").on(rounds.roundNumber),
	}),
);

export const users = pgTable(
	"users",
	{
		userId: varchar("userId").primaryKey(),
		email: varchar("email").notNull().unique(),
		roles: json("roles").notNull(),
		createdAt: timestamp("createdAt").notNull().defaultNow(),
		updatedAt: timestamp("updatedAt").notNull().defaultNow(),
	},
	(users) => ({
		usersEmailIdx: index("users_email_idx").on(users.email),
	}),
);

export const candidates = pgTable(
	"candidates",
	{
		candidateId: varchar("candidateId").primaryKey(),
		userId: varchar("userId").notNull(),
		firstName: varchar("firstName"),
		middleName: varchar("middleName"),
		lastName: varchar("lastName"),
		email: varchar("email").notNull().unique(),
		phone: varchar("phone"),
		location: varchar("location"),
		linkedInProfile: varchar("linkedInProfile"),
		githubProfile: varchar("githubProfile"),
		portfolio: varchar("portfolio"),
		experience: json("experience"),
		totalExperience: varchar("totalExperience"),
		workAuthorization: varchar("workAuthorization"),
		willingToRelocate: boolean("willingToRelocate"),
		isOpenToRemote: boolean("isOpenToRemote"),
		resumeLink: varchar("resumeLink"),
		resumeText: varchar("resumeText"),
		jobs: json("jobs").notNull().default([]),
		acceptedTermsAndConditions: boolean("acceptedTermsAndConditions"),
		receiveUpdatesOnApplication: boolean("receiveUpdatesOnApplication"),
		isOnboardingCompleted: boolean("isOnboardingCompleted").default(false),
		createdAt: timestamp("createdAt").notNull().defaultNow(),
		updatedAt: timestamp("updatedAt").notNull().defaultNow(),
	},
	(candidates) => ({
		candidatesEmailIdx: index("candidates_email_idx").on(candidates.email),
		candidatesUserIdIdx: index("candidates_user_id_idx").on(candidates.userId),
	}),
);

export const applications = pgTable(
	"applications",
	{
		applicationId: varchar("applicationId").primaryKey(),
		candidateId: varchar("candidateId").notNull(),
		jobId: varchar("jobId").notNull(),
		resumeLink: varchar("resumeLink").notNull(),
		coverLetterLink: varchar("coverLetterLink"),
		status: varchar("status").notNull(), // enum -> applied, rejected, accepted
		currentRound: varchar("currentRound").notNull(), // id of round
		resumeText: varchar("resumeText").notNull(),
		coverLetterText: varchar("coverLetterText"),
		skills: json("skills").notNull(),
		createdAt: timestamp("createdAt").notNull().defaultNow(),
		updatedAt: timestamp("updatedAt").notNull().defaultNow(),
	},
	(applications) => ({
		applicationJobIdIndex: index("application_job_id_idx").on(applications.jobId),
		applicationCandidateIdIndex: index("application_candidate_id_idx").on(applications.candidateId),
	}),
);

export const applicationTimeline = pgTable(
	"application_timeline",
	{
		applicationTimelineId: varchar("applicationTimelineId").primaryKey(),
		applicationId: varchar("applicationId").notNull(),
		roundId: varchar("roundId"),
		title: varchar("title").notNull(),
		description: varchar("description"),
		status: varchar("status").notNull(), // status of the timeline
		createdAt: timestamp("createdAt").notNull().defaultNow(),
		updatedAt: timestamp("updatedAt").notNull().defaultNow(),
	},
	(applicationTimeline) => ({
		applicationIdIdx: index("application_id_idx").on(applicationTimeline.applicationId),
		roundIdIdx: index("round_id_idx").on(applicationTimeline.roundId),
	}),
);

export const resumeScreening = pgTable(
	"resume_screening",
	{
		screeningId: varchar("screeningId").primaryKey(),
		applicationId: varchar("applicationId").notNull(),
		jobId: varchar("jobId").notNull(),
		candidateId: varchar("candidateId").notNull(),
		roundId: varchar("roundId").notNull(),
		roundResultId: varchar("roundResultId"),
		matchScore: real("matchScore").notNull(),
		status: varchar("status").notNull().default("pending"), // enum -> pending, completed
		createdAt: timestamp("createdAt").notNull().defaultNow(),
		updatedAt: timestamp("updatedAt").notNull().defaultNow(),
	},
	(resumeScreening) => ({
		resumeScreeningApplicationIdIndex: index("resume_screening_application_id_idx").on(resumeScreening.applicationId),
		resumeScreeningJobIdIndex: index("resume_screening_job_id_idx").on(resumeScreening.jobId),
		resumeScreeningCandidateIdIndex: index("resume_screening_candidate_id_idx").on(resumeScreening.candidateId),
		resumeScreeningMatchScoreIndex: index("resume_screening_match_score_idx").on(resumeScreening.matchScore),
	}),
);

export const roundResults = pgTable("round_results", {
	roundResultId: varchar("roundResultId").primaryKey(),
	roundId: varchar("roundId").notNull(),
	applicationId: varchar("applicationId").notNull(),
	feedback: json("feedback"), // aiScore, aiSummary, aiRecommendation and other properties required based on round type
	verdictBy: varchar("verdictBy"), // id of the person who gave verdict
	isQualified: boolean("isQualified"),
	createdAt: timestamp("createdAt").notNull().defaultNow(),
	updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export const interview = pgTable("interview", {
	interviewId: varchar("interviewId").primaryKey(),
	applicationId: varchar("applicationId").notNull(),
	roundId: varchar("roundId").notNull(),
	roundResultsId: varchar("roundResultsId"),
	status: varchar("status").notNull(), // enum -> PENDING, IN_PROGRESS, COMPLETED
	jobDescription: varchar("jobDescription").notNull(),
	resumeText: varchar("resumeText").notNull(), // snapshot at start
	questionType: varchar("questionType"),
	difficulty: varchar("difficulty"),
	createdAt: timestamp("createdAt").notNull().defaultNow(),
	updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export const questions = pgTable(
	"questions",
	{
		questionId: varchar("questionId").primaryKey(),
		interviewId: varchar("interviewId").notNull(),
		question: varchar("question").notNull(),
		answer: varchar("answer"),
		feedback: varchar("feedback"),
		isDisplayed: boolean("isDisplayed").notNull(),
		createdAt: timestamp("createdAt").notNull().defaultNow(),
		updatedAt: timestamp("updatedAt").notNull().defaultNow(),
	},
	(questions) => ({
		questionInterviewIdIndex: index("question_interview_id_idx").on(questions.interviewId),
		questionDisplayedIndex: index("question_displayed_idx").on(questions.isDisplayed),
	}),
);

export const reviewer = pgTable("reviewer", {
	reviewerId: varchar("reviewerId").primaryKey(),
	companyId: varchar("companyId").notNull(),
	name: varchar("name").notNull(),
	email: varchar("email").notNull().unique(),
	phone: varchar("phone"),
	jobTitle: varchar("jobTitle").notNull(),
	createdAt: timestamp("createdAt").notNull().defaultNow(),
	updatedAt: timestamp("updatedAt").notNull().defaultNow(),
},
(reviewer) => ({
	nameIdx: index("reviewer_name_idx").on(reviewer.name),
	emailIdx: index("reviewer_email_idx").on(reviewer.email),
}));

export const validationTable = pgTable("validations_table", {
	validationId: varchar("validationId").primaryKey(),
	reviewerId: varchar("reviewerId"),
	interviewId: varchar("interviewId").notNull(),
	jobId: varchar("jobId").notNull(),
	roundId: varchar("roundId").notNull(),
	roundResultId: varchar("roundResultId").notNull(),
	notes: varchar("notes"),
	status: varchar("status").notNull().default("PENDING"), // enum -> pending, completed
	createdAt: timestamp("createdAt").notNull().defaultNow(),
	updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});
