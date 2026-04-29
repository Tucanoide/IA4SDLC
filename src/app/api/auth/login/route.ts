import { NextResponse } from 'next/server'

const COOKIE_NAME = 'vault_session'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7 // 7 days

async function getSessionToken(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(`vault:${password}`)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

export async function POST(request: Request) {
  const { password } = await request.json()
  const accessPassword = process.env.ACCESS_PSW

  if (!accessPassword || password !== accessPassword) {
    return NextResponse.json({ error: 'Contraseña incorrecta' }, { status: 401 })
  }

  const token = await getSessionToken(accessPassword)
  const response = NextResponse.json({ ok: true })
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE,
    path: '/',
  })
  return response
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true })
  response.cookies.set(COOKIE_NAME, '', { maxAge: 0, path: '/' })
  return response
}
