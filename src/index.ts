import { Hono } from 'hono'
import { ActiveConfig } from './utils/config.utils'
import v1Router from './routes/v1'

const app = new Hono()

app.get('/', (c) => {
  return c.text(`Hello Hono! ${ActiveConfig.ENV}`)
})

app.route('/v1', v1Router)

export default app
