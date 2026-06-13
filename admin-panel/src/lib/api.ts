const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8787'

// ─── In-memory token store ────────────────────────────────────────────────────
// Token is never written to localStorage or an accessible cookie.
// It lives only in this module's memory (cleared on tab close / page refresh).
// On refresh, restoreToken() recovers it from the HttpOnly cookie via /api/auth/session.

let _token: string | null = null
let _restorePromise: Promise<void> | null = null

export function setToken(token: string): void {
  _token = token
}

export function clearToken(): void {
  _token = null
}

async function restoreToken(): Promise<void> {
  if (_token) return

  // Deduplicate concurrent calls — all callers share the same promise
  if (!_restorePromise) {
    _restorePromise = fetch('/api/auth/session')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => { if (data?.token) _token = data.token })
      .catch(() => {/* silently fail — apiFetch will handle 401 */})
      .finally(() => { _restorePromise = null })
  }

  return _restorePromise
}

export async function logout(): Promise<void> {
  clearToken()
  await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {})
  window.location.href = '/login'
}

// ─── Core fetch wrapper ───────────────────────────────────────────────────────

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  // Lazy token restore: on page refresh _token is null — recover from HttpOnly cookie
  if (!_token) {
    await restoreToken()
  }

  const headers: Record<string, string> = {
    ...(_token ? { Authorization: `Bearer ${_token}` } : {}),
  }

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json'
  }

  Object.assign(headers, options.headers)

  if (headers['Content-Type'] === 'undefined') {
    delete headers['Content-Type']
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
    })

    if (response.status === 401) {
      if (typeof window !== 'undefined') {
        // Clear state and cookie, then redirect to login
        await logout()
      }
    }

    return response
  } catch (error) {
    console.error(`[API Fetch Error] ${endpoint}:`, error)
    throw error
  }
}
