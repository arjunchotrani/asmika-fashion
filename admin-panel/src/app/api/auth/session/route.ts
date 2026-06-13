import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET ?? '')

// Called client-side on page refresh to restore the in-memory token from the HttpOnly cookie.
// Verifies the signature before returning — expired or tampered tokens are rejected.
export async function GET() {
  const cookieStore = await cookies()
  const token = cookieStore.get('asmika_admin_token')?.value

  if (!token) {
    return Response.json({ token: null }, { status: 401 })
  }

  try {
    await jwtVerify(token, JWT_SECRET)
    return Response.json({ token })
  } catch {
    // Token is expired or invalid — clear the stale cookie
    cookieStore.delete('asmika_admin_token')
    return Response.json({ token: null }, { status: 401 })
  }
}
