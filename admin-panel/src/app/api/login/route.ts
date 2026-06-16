import { cookies } from 'next/headers'

const WORKER_URL = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:8787'

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return Response.json({ success: false, message: 'Invalid request body' }, { status: 400 })
  }

  let workerRes: Response
  try {
    workerRes = await fetch(`${WORKER_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
  } catch {
    return Response.json({ success: false, message: 'Could not reach authentication server' }, { status: 502 })
  }

  const data = await workerRes.json()

  if (!data.success) {
    return Response.json(data, { status: workerRes.status })
  }

  const token: string = data.data.token

  // Set HttpOnly cookie — inaccessible to JavaScript, sent automatically by the browser
  const cookieStore = await cookies()
  cookieStore.set('asmika_admin_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 8, // 8 hours
    path: '/',
  })

  // Return token in response so the client can initialise its in-memory store
  // for direct Cloudflare Worker API calls (token is NOT stored in localStorage)
  return Response.json({
    success: true,
    message: 'Login successful',
    data: { token, admin: data.data.admin },
  })
}
