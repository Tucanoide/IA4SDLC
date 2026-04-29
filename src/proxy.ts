import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const COOKIE_NAME = 'vault_session'

async function getSessionToken(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(`vault:${password}`)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith('/login') || pathname.startsWith('/api/auth')) {
    return NextResponse.next()
  }

  const password = process.env.ACCESS_PSW
  if (!password) return NextResponse.next()

  const sessionCookie = request.cookies.get(COOKIE_NAME)
  const expectedToken = await getSessionToken(password)

  if (sessionCookie?.value === expectedToken) {
    return NextResponse.next()
  }

  const loginUrl = new URL('/login', request.url)
  if (pathname !== '/') loginUrl.searchParams.set('from', pathname)
  return NextResponse.redirect(loginUrl)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
