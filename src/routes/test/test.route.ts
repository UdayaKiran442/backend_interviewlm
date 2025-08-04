import { Hono } from "hono";
import { generateEmbeddingsService, generateResumeSummary } from "../../services/openai.service";
import { queryVectorEmbeddingsService, upsertVectorEmbeddingsService } from "../../services/pinecone.service";
import { ActiveConfig } from "../../utils/config.utils";
import { generateNanoId } from "../../utils/nanoid.utils";
import { getResumeScreeningDetailsFromDB } from "../../repository/resumeScreening/resumeScreening.repository";
import { userIdScript } from "../../scripts/userId.script";

const testRouter = new Hono()

testRouter.get('/', async (c) => {
    try {
        const resumeText = `Udaya Kiran Gonuguntla
Software Engineer | Node.js, React.js, SQL, LLMs, AI Integration
919160891919 gudaya2002@gmail.com linkedin.com/in/gonuguntla-udaya-kiran/ Vijayawada
Summary
With a focus on impactful solutions, I am a Software Engineer skilled in Node.js, React.js, SQL, and AI integration. I
enhanced user interaction by developing a robust chatbot with a 95% query resolution rate, effectively reducing response
times by 40%. My experience includes optimizing SQL queries to improve user analytics by 30% and leveraging LLMs to
automate job description analysis, leading to a 30% boost in interview success rates. I am committed to driving results
through innovative technology.
Skills
Programming Languages
Java | JavaScript | HTML/CSS | Python | Typescript
Tools and Frameworks
NodeJS | ReactJs | SQL (MySQL, PostgreSQL) | NoSQL (MongoDB, Firebase) | Flask | Git | AWS | Docker | CI/CD
Generative AI
OpenAI APIs | Fine-tuning | Vector Database | Prompt Engineering | Langchain
Work Experience
Software Engineer                                                                                                         Sep '24 - Dec '24
Nxtjob.Ai
- Developed a robust chatbot enabling seamless user interaction to address job search queries, achieving a 95% query
resolution rate and reducing response time by 40%.
- Integrated Fireworks LLM service provider and designed a fallback mechanism to dynamically switch between LLM
providers, ensuring 99% uptime and uninterrupted service delivery.
- Created a LinkedIn lead generation strategy for the marketing team, driving a 30% increase in qualified leads and
contributing to a 20% rise in user acquisition within six months.
- Designed and implemented a drip campaign system for new onboarded users, improving user engagement by 25% and
boosting retention rates by 15% over three months.
- Automated job description analysis by leveraging AI to generate concise summaries and tailored interview questions,
enhancing candidate preparation and boosting interview success rates by 30%.
- Partnered with cross-functional teams to drive code review and product roadmap success, resulting in 20% deployment
efficiency gains.
Backend Developer Intern                                                                                                  Mar '24 - Aug '24
Nxtjob.Ai
- Developed and optimized complex SQL queries for calculating user performance, improving user statistics tracking and
analytics across the platform by 30%.
- Utilized LLM models to generate and train synthetic data, increasing the accuracy of the platform's resume parser by 40%.
- Designed and developed scalable backend APIs for community features, utilizing robust system design principles, leading to
a 35% increase in user engagement within the NxtJob AI ecosystem.
- Implemented OpenAI API and prompt engineering to generate interview reports from user-provided transcripts, automating
the process and reducing manual effort by 50%.
- Integrated error logging tools like Baselime and set up automated messaging to Slack, leading to a 40% faster response
time to issues.
- Partnered with product managers to clarify software requirements, ensuring seamless backend development and 35%
increase in project efficiency.
Projects
Budget Buddy                                                                                                               Jan '25 - Feb '25
- Built an AI chatbot using Pinecone+OpenAI to explain India's 2025-26 Budget, boosting user engagement by 30%.
- Designed and implemented data scraping solution using Langchain framework, extracting 5 data points from the internet
and successfully embedding them into pinecone vector databases.
Bus Booking API                                                                                                           Apr '23 - May '23
- Built scalable NestJS APIs with PostgreSQL (AWS RDS), boosting system reliability by 35% through robust system design.
Education
Bachelor of Technology - Computer Science
BML Munjal University, Gurugram`;
        const resumeEmbeddings = await generateEmbeddingsService(resumeText)
        const matchScore = await queryVectorEmbeddingsService({
            indexName: ActiveConfig.JD_INDEX,
            vector: resumeEmbeddings ?? [],
            jobId: "job-wxQ8EagEnzcb8JURSvYH1"
        })
        return c.json({ matchScore })
    } catch (error) {

    }
})


testRouter.get('/v1', async (c) => {
    const resumeText = `Udaya Kiran Gonuguntla
Software Engineer | Node.js, React.js, SQL, LLMs, AI Integration
919160891919 gudaya2002@gmail.com linkedin.com/in/gonuguntla-udaya-kiran/ Vijayawada
Summary
With a focus on impactful solutions, I am a Software Engineer skilled in Node.js, React.js, SQL, and AI integration. I
enhanced user interaction by developing a robust chatbot with a 95% query resolution rate, effectively reducing response
times by 40%. My experience includes optimizing SQL queries to improve user analytics by 30% and leveraging LLMs to
automate job description analysis, leading to a 30% boost in interview success rates. I am committed to driving results
through innovative technology.
Skills
Programming Languages
Java | JavaScript | HTML/CSS | Python | Typescript
Tools and Frameworks
NodeJS | ReactJs | SQL (MySQL, PostgreSQL) | NoSQL (MongoDB, Firebase) | Flask | Git | AWS | Docker | CI/CD
Generative AI
OpenAI APIs | Fine-tuning | Vector Database | Prompt Engineering | Langchain
Work Experience
Software Engineer                                                                                                         Sep '24 - Dec '24
Nxtjob.Ai
- Developed a robust chatbot enabling seamless user interaction to address job search queries, achieving a 95% query
resolution rate and reducing response time by 40%.
- Integrated Fireworks LLM service provider and designed a fallback mechanism to dynamically switch between LLM
providers, ensuring 99% uptime and uninterrupted service delivery.
- Created a LinkedIn lead generation strategy for the marketing team, driving a 30% increase in qualified leads and
contributing to a 20% rise in user acquisition within six months.
- Designed and implemented a drip campaign system for new onboarded users, improving user engagement by 25% and
boosting retention rates by 15% over three months.
- Automated job description analysis by leveraging AI to generate concise summaries and tailored interview questions,
enhancing candidate preparation and boosting interview success rates by 30%.
- Partnered with cross-functional teams to drive code review and product roadmap success, resulting in 20% deployment
efficiency gains.
Backend Developer Intern                                                                                                  Mar '24 - Aug '24
Nxtjob.Ai
- Developed and optimized complex SQL queries for calculating user performance, improving user statistics tracking and
analytics across the platform by 30%.
- Utilized LLM models to generate and train synthetic data, increasing the accuracy of the platform's resume parser by 40%.
- Designed and developed scalable backend APIs for community features, utilizing robust system design principles, leading to
a 35% increase in user engagement within the NxtJob AI ecosystem.
- Implemented OpenAI API and prompt engineering to generate interview reports from user-provided transcripts, automating
the process and reducing manual effort by 50%.
- Integrated error logging tools like Baselime and set up automated messaging to Slack, leading to a 40% faster response
time to issues.
- Partnered with product managers to clarify software requirements, ensuring seamless backend development and 35%
increase in project efficiency.
Projects
Budget Buddy                                                                                                               Jan '25 - Feb '25
- Built an AI chatbot using Pinecone+OpenAI to explain India's 2025-26 Budget, boosting user engagement by 30%.
- Designed and implemented data scraping solution using Langchain framework, extracting 5 data points from the internet
and successfully embedding them into pinecone vector databases.
Bus Booking API                                                                                                           Apr '23 - May '23
- Built scalable NestJS APIs with PostgreSQL (AWS RDS), boosting system reliability by 35% through robust system design.
Education
Bachelor of Technology - Computer Science
BML Munjal University, Gurugram`;
    try {
        const resumeSummary = await generateResumeSummary(resumeText)
        const resumeEmbeddings = await generateEmbeddingsService(resumeSummary.summary)
        await upsertVectorEmbeddingsService({
            indexName: ActiveConfig.RESUME_INDEX,
            vector: resumeEmbeddings ?? [],
            metadata: {
                resumeText,
                summary: resumeSummary.summary,
                skills: resumeSummary.skills,
                jobId: "job-zJJY0YDDg79Ee6185PR0Y",
                applicationId: "application-lQgZ8rWeDHKJZz_iK2qDk"
            }
        })
        return c.json({ message: "Resume embeddings created successfully" })
        // const prompt = "Experience in Nodejs, LLMs, AI Integration";
        // const promptEmbeddings = await generateEmbeddings(prompt);
        // const queryResponse = await queryVectorEmbeddings({
        //     indexName: ActiveConfig.RESUME_INDEX,
        //     vector: promptEmbeddings ?? [],
        //     jobId: "job-zJJY0YDDg79Ee6185PR0Y",
        // })
        // return c.json({ queryResponse })
    } catch (error) {

    }
})

testRouter.get('/v2', async (c) => {
    try {
        const res = await getResumeScreeningDetailsFromDB({
            screeningId: "screening-j3jauDK3WG_GRaxPUmn5O",
            hrId: "VofeF3rFUHbcjVZeTamp8"
        })
        return c.json({ success: true, message: 'Applications fetched', res }, 200)
    } catch (error) {
       
        return c.json({ success: false, message: 'Something went wrong' }, 500)
    }
})


testRouter.get('/v3', async (c) => {
    try {
        await userIdScript()
        return c.json({ success: true, message: 'Applications fetched' }, 200)
    } catch (error) {
        console.log(error)
        return c.json({ success: false, message: 'Something went wrong' }, 500)
    }
})

export default testRouter;