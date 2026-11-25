export type User = { id: string; name: string; avatarUrl?: string }

// Who is logged in. The backend keeps the login in cookies, so every request has to send them along.
export function useAuth() {
  const apiBase = useRuntimeConfig().public.apiBase
  const api = $fetch.create({ baseURL: apiBase, credentials: 'include' })
  const user = useState<User | null>('user', () => null)

  // Not logged in is not an error: the user is then simply null.
  async function load() {
    user.value = await api<User>('/auth/me').catch(() => null)
  }

  // A full page load, because the backend sends the browser on to Google.
  function login() {
    window.location.href = `${apiBase}/auth/login`
  }

  async function logout() {
    await api('/auth/logout', { method: 'POST' })
    user.value = null
  }

  return { user: readonly(user), load, login, logout }
}
