import { createServerClient, parseCookieHeader, serializeCookieHeader } from '@supabase/ssr'
import type { User } from '@supabase/supabase-js'
import { Hono, type Context } from 'hono'
import { upsertProfile, type Profile } from './storage.js'

const FRONTEND_URL = 'http://localhost:3000'

// Login with Google via Supabase Auth. The backend keeps the tokens in cookies it sets itself,
// so the frontend never talks to Supabase and never sees a token.
export const auth = new Hono()

// A new client for every request: it reads the tokens from this request's cookies
// and writes changed tokens into this response's Set-Cookie headers.
function authClient(c: Context) {
  return createServerClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    // httpOnly: JavaScript in the browser cannot read the tokens, only the backend can.
    cookieOptions: { httpOnly: true },
    cookies: {
      getAll: () => parseCookieHeader(c.req.header('Cookie') ?? ''),
      setAll: (cookies) => {
        for (const { name, value, options } of cookies) {
          c.header('Set-Cookie', serializeCookieHeader(name, value, options), { append: true })
        }
      },
    },
  })
}

// Who is logged in, read from this request's cookies. Undefined if nobody is.
// Routes that need the user call this; the user id never comes from the request body.
export async function currentUser(c: Context): Promise<Profile | undefined> {
  const { data } = await authClient(c).auth.getUser()
  return data.user ? toProfile(data.user) : undefined
}

function toProfile({ id, email, user_metadata }: User): Profile {
  const { full_name, name, avatar_url } = user_metadata
  return { id, email: email!, name: full_name ?? name ?? email, avatarUrl: avatar_url }
}

// Sends the browser to Google. Supabase sends it back to /auth/callback afterwards.
auth.get('/login', async (c) => {
  const redirectTo = new URL('/auth/callback', c.req.url).toString()
  const { data, error } = await authClient(c).auth.signInWithOAuth({ provider: 'google', options: { redirectTo } })
  if (error) return c.json({ error: error.message }, 500)
  return c.redirect(data.url)
})

// Trades the one-time code for the tokens, which end up in cookies, then returns to the overview.
auth.get('/callback', async (c) => {
  const code = c.req.query('code')
  if (!code) return c.json({ error: 'Missing code' }, 400)
  const { data, error } = await authClient(c).auth.exchangeCodeForSession(code)
  if (error) return c.json({ error: error.message }, 401)
  // Saves name, email and avatar, so others can find this person by email and see the avatar.
  await upsertProfile(toProfile(data.user))
  return c.redirect(FRONTEND_URL)
})

auth.get('/me', async (c) => {
  const user = await currentUser(c)
  if (!user) return c.json({ error: 'Not logged in' }, 401)
  return c.json({ id: user.id, name: user.name, avatarUrl: user.avatarUrl })
})

auth.post('/logout', async (c) => {
  await authClient(c).auth.signOut()
  return c.body(null, 204)
})
