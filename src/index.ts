import { Hono } from 'hono'
import { ActiveConfig } from './utils/config.utils'
import companyRoute from './routes/company.route'
import jobRoute from './routes/job.route'

const app = new Hono()

app.get('/', (c) => {
  return c.text(`Hello Hono! ${ActiveConfig.ENV}`)
})

app.route('/company', companyRoute)
app.route('/job', jobRoute)

export default app
