import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

function isValidJwtStructure(token: string): boolean {
  const parts = token.split('.')
  if (parts.length !== 3) return false
  try {
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')))
    // Check expiry
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return false
    // Must have an email claim (set by our backend)
    if (!payload.email) return false
    return true
  } catch {
    return false
  }
}

export function middleware(request: NextRequest) {
  const token = request.cookies.get('asmika_admin_token')?.value
  const isLoginPage = request.nextUrl.pathname === '/login'

  const isAuthenticated = token ? isValidJwtStructure(token) : false

  if (!isAuthenticated && !isLoginPage) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (isAuthenticated && isLoginPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
