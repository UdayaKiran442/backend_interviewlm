import { Hono } from 'hono'
import { ActiveConfig } from './utils/config.utils'
import v1Router from './routes/v1'
import testRouter from './routes/test/test.route'

const app = new Hono()

app.get('/', (c) => {
  return c.text(`Hello Hono ${ActiveConfig.ENV}`)
})

// v1 router
app.route('/v1', v1Router)
app.route('/test', testRouter)

export default app
