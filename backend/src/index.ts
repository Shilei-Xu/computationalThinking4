import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { deleteObject, insertObject, listObjects, updateObject } from './storage'

const app = new Hono()

// The frontend runs on another port, so the browser needs permission to call us.
app.use('*', cors())

app.get('/objects', async c => c.json(await listObjects(), 200))

app.post('/objects', async c => {
  const inserted = await insertObject(await c.req.json())
  return inserted ? c.json(inserted, 201) : c.json({ error: 'Object already exists' }, 409)
})

app.patch('/objects/:id', async c => {
  const updated = await updateObject(c.req.param('id'), await c.req.json())
  return updated ? c.json(updated, 200) : c.notFound()
})

app.delete('/objects/:id', async c => {
  const deleted = await deleteObject(c.req.param('id'))
  return deleted ? c.body(null, 204) : c.notFound()
})

serve({ fetch: app.fetch, port: 3001 }, info => console.log(`Backend running on http://localhost:${info.port}`))
