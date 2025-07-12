import { Hono } from 'hono'
import { ActiveConfig } from './utils/config.utils'
import companyRoute from './routes/company.route'

const app = new Hono()

app.get('/', (c) => {
  return c.text(`Hello Hono! ${ActiveConfig.ENV}`)
})

app.route('/company', companyRoute)

export default app
