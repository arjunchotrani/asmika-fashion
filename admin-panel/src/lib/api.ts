const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8787'

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('asmika_admin_token') : null
  
  const headers: Record<string, string> = {
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  }

  // Only set application/json if body is not FormData and not explicitly set to undefined
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json'
  }

  // If user explicitly passed a header, it overrides defaults
  Object.assign(headers, options.headers)

  // Remove content-type if explicitly marked as 'undefined' (e.g. for FormData)
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
        localStorage.removeItem('asmika_admin_token')
        window.location.href = '/login'
      }
    }

    return response
  } catch (error) {
    console.error(`[API Fetch Error] ${endpoint}:`, error)
    throw error
  }
}
