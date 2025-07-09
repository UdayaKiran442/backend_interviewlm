import { Hono } from 'hono'
import { ActiveConfig } from './utils/config.utils'

const app = new Hono()

app.get('/', (c) => {
  return c.text(`Hello Hono! ${ActiveConfig.ENV}`)
})

export default app
